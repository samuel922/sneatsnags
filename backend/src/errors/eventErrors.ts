import { ZodError } from "zod";

// Base error class for all event-related errors
export abstract class EventError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

// Validation errors
export class EventValidationError extends EventError {
  readonly code = "EVENT_VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(message: string, public readonly validationErrors: ZodError | any) {
    super(message, validationErrors);
  }

  static fromZodError(error: ZodError): EventValidationError {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return new EventValidationError(
      "Event validation failed",
      formattedErrors
    );
  }
}

// Event not found error
export class EventNotFoundError extends EventError {
  readonly code = "EVENT_NOT_FOUND";
  readonly statusCode = 404;

  constructor(eventId: string) {
    super(`Event not found: ${eventId}`, { eventId });
  }
}

// Event already exists error
export class EventAlreadyExistsError extends EventError {
  readonly code = "EVENT_ALREADY_EXISTS";
  readonly statusCode = 409;

  constructor(identifier: string, field: string = "name") {
    super(`Event already exists with ${field}: ${identifier}`, { identifier, field });
  }
}

// Event operation not allowed error
export class EventOperationNotAllowedError extends EventError {
  readonly code = "EVENT_OPERATION_NOT_ALLOWED";
  readonly statusCode = 403;

  constructor(operation: string, reason: string) {
    super(`Operation '${operation}' not allowed: ${reason}`, { operation, reason });
  }
}

// Event date/time conflicts
export class EventDateConflictError extends EventError {
  readonly code = "EVENT_DATE_CONFLICT";
  readonly statusCode = 409;

  constructor(message: string, conflictDetails: any) {
    super(message, conflictDetails);
  }
}

// Event capacity errors
export class EventCapacityError extends EventError {
  readonly code = "EVENT_CAPACITY_ERROR";
  readonly statusCode = 400;

  constructor(message: string, capacityDetails: any) {
    super(message, capacityDetails);
  }
}

// Event database operation errors
export class EventDatabaseError extends EventError {
  readonly code = "EVENT_DATABASE_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, originalError: any) {
    super(`Database operation failed: ${operation}`, {
      operation,
      originalError: originalError.message,
    });
  }
}

// Event external API errors
export class EventExternalApiError extends EventError {
  readonly code = "EVENT_EXTERNAL_API_ERROR";
  readonly statusCode = 502;

  constructor(service: string, operation: string, originalError: any) {
    super(`External API error from ${service} during ${operation}`, {
      service,
      operation,
      originalError: originalError.message,
    });
  }
}

// Event business logic errors
export class EventBusinessLogicError extends EventError {
  readonly code = "EVENT_BUSINESS_LOGIC_ERROR";
  readonly statusCode = 422;

  constructor(rule: string, details: any) {
    super(`Business rule violation: ${rule}`, details);
  }
}

// Event file/media errors
export class EventMediaError extends EventError {
  readonly code = "EVENT_MEDIA_ERROR";
  readonly statusCode = 400;

  constructor(operation: string, details: any) {
    super(`Media operation failed: ${operation}`, details);
  }
}

// Event permission errors
export class EventPermissionError extends EventError {
  readonly code = "EVENT_PERMISSION_ERROR";
  readonly statusCode = 403;

  constructor(action: string, resource: string, userId?: string) {
    super(`Permission denied: ${action} on ${resource}`, {
      action,
      resource,
      userId,
    });
  }
}

// Event rate limit errors
export class EventRateLimitError extends EventError {
  readonly code = "EVENT_RATE_LIMIT_ERROR";
  readonly statusCode = 429;

  constructor(limit: number, windowMs: number) {
    super(`Rate limit exceeded: ${limit} requests per ${windowMs}ms`, {
      limit,
      windowMs,
    });
  }
}

// Event section errors
export class EventSectionError extends EventError {
  readonly code = "EVENT_SECTION_ERROR";
  readonly statusCode = 400;

  constructor(message: string, sectionDetails: any) {
    super(message, sectionDetails);
  }
}

// Event transaction errors
export class EventTransactionError extends EventError {
  readonly code = "EVENT_TRANSACTION_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, details: any) {
    super(`Transaction failed during ${operation}`, details);
  }
}

// Helper function to determine if an error is an EventError
export function isEventError(error: any): error is EventError {
  return error instanceof EventError;
}

// Helper function to convert any error to EventError
export function toEventError(error: any, context?: string): EventError {
  if (isEventError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return EventValidationError.fromZodError(error);
  }

  // Database errors
  if (error.code === 'P2002') { // Prisma unique constraint
    return new EventAlreadyExistsError(error.meta?.target?.[0] || 'unknown field');
  }

  if (error.code === 'P2025') { // Prisma record not found
    return new EventNotFoundError(error.meta?.cause || 'unknown');
  }

  // Generic database errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return new EventDatabaseError(context || 'unknown operation', error);
  }

  // Default to generic database error
  return new EventDatabaseError(context || 'unknown operation', error);
}

// Error handler middleware for events
export function handleEventError(error: any, context?: string): never {
  const eventError = toEventError(error, context);
  throw eventError;
}