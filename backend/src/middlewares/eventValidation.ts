import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { 
  CreateEventValidationSchema,
  UpdateEventValidationSchema,
  EventSearchValidationSchema,
  CreateSectionValidationSchema,
  UpdateSectionValidationSchema,
  EventIdValidationSchema,
  BulkEventOperationSchema,
  EventStatsValidationSchema,
} from "../validations/eventValidation";
import { EventValidationError } from "../errors/eventErrors";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../types/auth";

// Generic validation middleware factory
export function validateSchema<T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const result = schema.parse(data);
      
      // Replace the request data with parsed and validated data
      (req as any)[source] = result;
      
      logger.debug("Validation successful", {
        source,
        endpoint: req.path,
        method: req.method,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("Validation failed", {
          source,
          endpoint: req.path,
          method: req.method,
          errors: error.errors,
        });
        
        const validationError = EventValidationError.fromZodError(error);
        return res.status(400).json({
          success: false,
          error: validationError.message,
          details: validationError.details,
          code: validationError.code,
        });
      }
      
      logger.error("Unexpected validation error", {
        source,
        endpoint: req.path,
        method: req.method,
        error: error.message,
      });
      
      return res.status(500).json({
        success: false,
        error: "Internal validation error",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

// Specific validation middlewares for event endpoints
export const validateCreateEvent = validateSchema(CreateEventValidationSchema, 'body');
export const validateUpdateEvent = validateSchema(UpdateEventValidationSchema, 'body');
export const validateEventSearch = validateSchema(EventSearchValidationSchema, 'query');
export const validateCreateSection = validateSchema(CreateSectionValidationSchema, 'body');
export const validateUpdateSection = validateSchema(UpdateSectionValidationSchema, 'body');
export const validateEventId = validateSchema(EventIdValidationSchema, 'params');
export const validateBulkOperation = validateSchema(BulkEventOperationSchema, 'body');
export const validateEventStats = validateSchema(EventStatsValidationSchema, 'query');

// Combined validation middleware for event creation with authorization
export function validateEventCreation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // First validate the request body
  validateCreateEvent(req, res, (err) => {
    if (err) return next(err);
    
    // Additional business logic validation
    const eventData = req.body;
    
    // Check if user has permission to create events
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to create events",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }
    
    // Validate event date is not too far in the future (e.g., 2 years)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
    
    if (new Date(eventData.eventDate) > maxFutureDate) {
      return res.status(400).json({
        success: false,
        error: "Event date cannot be more than 2 years in the future",
        code: "EVENT_DATE_TOO_FAR",
      });
    }
    
    // Validate sections have unique names
    const sectionNames = eventData.sections.map((s: any) => s.name.toLowerCase());
    const uniqueSectionNames = new Set(sectionNames);
    
    if (sectionNames.length !== uniqueSectionNames.size) {
      return res.status(400).json({
        success: false,
        error: "Section names must be unique within an event",
        code: "DUPLICATE_SECTION_NAMES",
      });
    }
    
    logger.info("Event creation validation passed", {
      eventName: eventData.name,
      sectionsCount: eventData.sections.length,
      userId: req.user.id,
    });
    
    next();
  });
}

// Combined validation middleware for event updates with authorization
export function validateEventUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // First validate the event ID
  validateEventId(req, res, (err) => {
    if (err) return next(err);
    
    // Then validate the update data
    validateUpdateEvent(req, res, (err) => {
      if (err) return next(err);
      
      // Check if user has permission to update events
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions to update events",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }
      
      const updateData = req.body;
      
      // Validate event date is not too far in the future if being updated
      if (updateData.eventDate) {
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
        
        if (new Date(updateData.eventDate) > maxFutureDate) {
          return res.status(400).json({
            success: false,
            error: "Event date cannot be more than 2 years in the future",
            code: "EVENT_DATE_TOO_FAR",
          });
        }
      }
      
      logger.info("Event update validation passed", {
        eventId: req.params.id,
        updateFields: Object.keys(updateData),
        userId: req.user.id,
      });
      
      next();
    });
  });
}

// Validation middleware for event deletion
export function validateEventDeletion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  validateEventId(req, res, (err) => {
    if (err) return next(err);
    
    // Check if user has permission to delete events
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to delete events",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }
    
    logger.info("Event deletion validation passed", {
      eventId: req.params.id,
      userId: req.user.id,
    });
    
    next();
  });
}

// Validation middleware for section operations
export function validateSectionCreation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Validate event ID from params
  validateEventId(req, res, (err) => {
    if (err) return next(err);
    
    // Add eventId to body for validation
    req.body.eventId = req.params.id;
    
    // Validate section data
    validateCreateSection(req, res, (err) => {
      if (err) return next(err);
      
      // Check permissions
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions to create sections",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }
      
      logger.info("Section creation validation passed", {
        eventId: req.params.id,
        sectionName: req.body.name,
        userId: req.user.id,
      });
      
      next();
    });
  });
}

// Rate limiting validation middleware
export function validateRateLimit(maxRequests: number, windowMs: number) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
    
    const clientData = requestCounts.get(clientId) || { count: 0, resetTime: now + windowMs };
    
    if (clientData.count >= maxRequests) {
      logger.warn("Rate limit exceeded", {
        clientId,
        endpoint: req.path,
        method: req.method,
        count: clientData.count,
        maxRequests,
      });
      
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
    }
    
    clientData.count++;
    requestCounts.set(clientId, clientData);
    
    next();
  };
}

// Content type validation middleware
export function validateContentType(allowedTypes: string[] = ['application/json']) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        success: false,
        error: "Unsupported content type",
        code: "UNSUPPORTED_CONTENT_TYPE",
        allowedTypes,
      });
    }
    
    next();
  };
}

// File size validation middleware
export function validateFileSize(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        success: false,
        error: "Request entity too large",
        code: "REQUEST_TOO_LARGE",
        maxSize,
      });
    }
    
    next();
  };
}

// Sanitization middleware for event data
export function sanitizeEventData(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    // Remove potentially dangerous characters and normalize data
    const sanitizeString = (str: string) => {
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    };
    
    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(req.body);
    
    logger.debug("Event data sanitized", {
      endpoint: req.path,
      method: req.method,
    });
  }
  
  next();
}

// Combined middleware for complete event validation
export function validateEventRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Apply all validations in sequence
  const middlewares = [
    validateContentType(),
    validateFileSize(),
    sanitizeEventData,
    validateRateLimit(100, 60000), // 100 requests per minute
  ];
  
  let index = 0;
  
  const runNext = (err?: any) => {
    if (err) return next(err);
    
    if (index >= middlewares.length) {
      return next();
    }
    
    const middleware = middlewares[index++];
    middleware(req, res, runNext);
  };
  
  runNext();
}