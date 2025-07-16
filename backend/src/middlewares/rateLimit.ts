import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  lastHit: number;
}

class RateLimitStore {
  private store = new Map<string, RateLimitInfo>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(key);
      }
    }
  }

  public get(key: string): RateLimitInfo | undefined {
    return this.store.get(key);
  }

  public set(key: string, info: RateLimitInfo): void {
    this.store.set(key, info);
  }

  public increment(key: string, windowMs: number): RateLimitInfo {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Create new entry or reset expired one
      const info: RateLimitInfo = {
        count: 1,
        resetTime: now + windowMs,
        lastHit: now,
      };
      this.store.set(key, info);
      return info;
    }

    // Increment existing entry
    existing.count++;
    existing.lastHit = now;
    this.store.set(key, existing);
    return existing;
  }

  public reset(key: string): void {
    this.store.delete(key);
  }

  public getStats(): { totalKeys: number; oldestEntry: number; newestEntry: number } {
    const now = Date.now();
    let oldest = now;
    let newest = 0;

    for (const info of this.store.values()) {
      if (info.lastHit < oldest) oldest = info.lastHit;
      if (info.lastHit > newest) newest = info.lastHit;
    }

    return {
      totalKeys: this.store.size,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  public destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limit store
const globalStore = new RateLimitStore();

export function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests from this IP, please try again later.",
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req: Request) => req.ip || 'unknown',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get current rate limit info
    const info = globalStore.increment(key, windowMs);
    
    // Calculate time remaining until reset
    const timeRemaining = Math.max(0, info.resetTime - now);
    const resetTimeSeconds = Math.ceil(timeRemaining / 1000);
    
    // Add standard headers
    if (standardHeaders) {
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - info.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(info.resetTime).toISOString());
    }
    
    // Add legacy headers
    if (legacyHeaders) {
      res.setHeader('X-RateLimit-Window', windowMs.toString());
      res.setHeader('X-RateLimit-Current', info.count.toString());
    }
    
    // Check if limit exceeded
    if (info.count > max) {
      // Add retry-after header
      res.setHeader('Retry-After', resetTimeSeconds.toString());
      
      // Log rate limit exceeded
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        key,
        count: info.count,
        max,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        resetTime: new Date(info.resetTime).toISOString(),
      });
      
      // Return rate limit error
      return res.status(429).json({
        success: false,
        error: message,
        code: "RATE_LIMIT_EXCEEDED",
        details: {
          limit: max,
          current: info.count,
          resetTime: new Date(info.resetTime).toISOString(),
          retryAfter: resetTimeSeconds,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    // Log successful request (optional)
    if (info.count === 1) {
      logger.debug("Rate limit tracking started", {
        ip: req.ip,
        key,
        endpoint: req.path,
        method: req.method,
        windowMs,
        max,
      });
    }
    
    // Continue to next middleware
    next();
    
    // Skip incrementing for successful/failed requests if configured
    res.on('finish', () => {
      const shouldSkip = 
        (skipSuccessfulRequests && res.statusCode < 400) ||
        (skipFailedRequests && res.statusCode >= 400);
      
      if (shouldSkip) {
        // Decrement the counter
        const currentInfo = globalStore.get(key);
        if (currentInfo && currentInfo.count > 0) {
          currentInfo.count--;
          globalStore.set(key, currentInfo);
        }
      }
    });
  };
}

// Specialized rate limiters for different use cases
export const createRateLimiter = (options: RateLimitOptions) => {
  return rateLimitMiddleware(options);
};

// Preset rate limiters
export const strictRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "Too many requests. Please try again later.",
});

export const moderateRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes
  message: "Rate limit exceeded. Please slow down.",
});

export const lenientRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: "Rate limit exceeded.",
});

// API-specific rate limiters
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 authentication attempts per 15 minutes
  message: "Too many authentication attempts. Please try again later.",
  skipSuccessfulRequests: true, // Don't count successful auth attempts
});

export const adminRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 admin operations per minute
  message: "Admin rate limit exceeded.",
});

// Rate limit by user ID instead of IP
export const userRateLimit = (options: Omit<RateLimitOptions, 'keyGenerator'>) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req: Request) => {
      const user = (req as any).user;
      return user?.id || req.ip || 'unknown';
    },
  });
};

// Rate limit statistics endpoint
export const getRateLimitStats = (req: Request, res: Response) => {
  const stats = globalStore.getStats();
  
  res.json({
    success: true,
    data: {
      ...stats,
      timestamp: new Date().toISOString(),
    },
  });
};

// Reset rate limit for a specific key (admin only)
export const resetRateLimit = (req: Request, res: Response) => {
  const { key } = req.params;
  
  if (!key) {
    return res.status(400).json({
      success: false,
      error: "Key parameter is required",
    });
  }
  
  globalStore.reset(key);
  
  logger.info("Rate limit reset", {
    key,
    adminId: (req as any).user?.id,
  });
  
  res.json({
    success: true,
    message: `Rate limit reset for key: ${key}`,
  });
};

// Cleanup function for graceful shutdown
export const cleanupRateLimit = () => {
  globalStore.destroy();
};