/**
 * Custom error classes for better error handling across the application
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = "External service error") {
    super(message, 502, false);
  }
}

// Specific application errors
export class DuplicateEmailError extends ConflictError {
  constructor(email: string) {
    super(`An account with email ${email} already exists`);
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super("Invalid email or password");
  }
}

export class AccountInactiveError extends AuthenticationError {
  constructor() {
    super("Account is inactive. Please contact support.");
  }
}

export class EmailNotVerifiedError extends AuthenticationError {
  constructor() {
    super("Please verify your email address before logging in");
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = "Invalid or expired token") {
    super(message);
  }
}

export class WeakPasswordError extends ValidationError {
  constructor() {
    super("Password does not meet security requirements", {
      password: ["Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"]
    });
  }
}

export class OfferExpiredError extends AppError {
  constructor() {
    super("This offer has expired", 400);
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super("Insufficient funds for this transaction", 400);
  }
}

export class TicketNotAvailableError extends AppError {
  constructor() {
    super("The requested tickets are no longer available", 400);
  }
}

export class PaymentFailedError extends AppError {
  constructor(message: string = "Payment processing failed") {
    super(message, 402);
  }
}

export class EventNotFoundError extends NotFoundError {
  constructor(eventId: string) {
    super(`Event with ID ${eventId} not found`);
  }
}

export class ListingNotFoundError extends NotFoundError {
  constructor(listingId: string) {
    super(`Listing with ID ${listingId} not found`);
  }
}

export class OfferNotFoundError extends NotFoundError {
  constructor(offerId: string) {
    super(`Offer with ID ${offerId} not found`);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}

export class UnauthorizedOfferError extends AuthorizationError {
  constructor() {
    super("You are not authorized to perform this action on this offer");
  }
}

export class UnauthorizedListingError extends AuthorizationError {
  constructor() {
    super("You are not authorized to perform this action on this listing");
  }
}

export class BrokerIntegrationError extends ExternalServiceError {
  constructor(brokerName: string, message: string) {
    super(`${brokerName} integration error: ${message}`);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = "File upload failed") {
    super(message, 400);
  }
}

export class InvalidFileTypeError extends ValidationError {
  constructor(allowedTypes: string[]) {
    super("Invalid file type", {
      file: [`File type must be one of: ${allowedTypes.join(", ")}`]
    });
  }
}

export class FileSizeError extends ValidationError {
  constructor(maxSize: string) {
    super("File size too large", {
      file: [`File size must be less than ${maxSize}`]
    });
  }
}

// Utility function to check if an error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Utility function to format Zod errors
export const formatZodError = (error: any): ValidationError => {
  const formattedErrors: Record<string, string[]> = {};
  
  if (error.errors) {
    error.errors.forEach((err: any) => {
      const field = err.path.join('.');
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(err.message);
    });
  }
  
  return new ValidationError("Validation failed", formattedErrors);
};