import winston from "winston";
import { config } from "../config/config";

const logger = winston.createLogger({
  level: config.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: {
    service: 'sneatsnags-backend',
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    new winston.transports.File({ 
      filename: "logs/error.log", 
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
  ],
});

if (config.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Additional logging utilities for production monitoring
export const logError = (error: any, context?: any) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name,
    context: context || {}
  });
};

export const logRequest = (req: any, res: any, duration: number) => {
  if (config.NODE_ENV === "production") {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  }
};

export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  if (duration > 1000) { // Log slow operations (>1s)
    logger.warn('Slow Operation', {
      operation,
      duration: `${duration}ms`,
      metadata: metadata || {}
    });
  }
};

export { logger };
