import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError, ValidationError, formatZodError, isOperationalError } from "../utils/errors";
import { ZodError } from "zod";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = formatZodError(error);
    return res.status(validationError.statusCode).json({
      success: false,
      error: "Validation Error",
      message: validationError.message,
      errors: validationError.errors,
    });
  }

  // Handle our custom AppError instances
  if (error instanceof AppError) {
    const response: any = {
      success: false,
      error: error.constructor.name.replace('Error', ''),
      message: error.message,
    };

    // Add validation errors if it's a ValidationError
    if (error instanceof ValidationError) {
      response.errors = error.errors;
    }

    return res.status(error.statusCode).json(response);
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Authentication",
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Authentication",
      message: "Token expired",
    });
  }

  // Handle Prisma errors
  if (error.code?.startsWith("P")) {
    return handlePrismaError(error, res);
  }

  // Handle mongoose validation errors (if using MongoDB)
  if (error.name === "ValidationError" && error.errors) {
    const validationErrors: Record<string, string[]> = {};
    Object.keys(error.errors).forEach(key => {
      validationErrors[key] = [error.errors[key].message];
    });

    return res.status(400).json({
      success: false,
      error: "Validation",
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  // Handle CastError (invalid ObjectId in MongoDB)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID",
      message: "Invalid resource ID format",
    });
  }

  // Handle multer errors (file upload)
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File Upload",
      message: "File size exceeds limit",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: "File Upload",
      message: "Unexpected file field",
    });
  }

  // Log unexpected errors for debugging
  if (!isOperationalError(error)) {
    logger.error("Unexpected error:", error);
  }

  // Return generic error response
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : error.message,
  });
};

// Helper function to handle Prisma errors
const handlePrismaError = (error: any, res: Response) => {
  const response = {
    success: false,
    error: "Database Error",
    message: "Database operation failed",
  };

  switch (error.code) {
    case "P2002":
      response.error = "Duplicate Entry";
      response.message = "This resource already exists";
      return res.status(409).json(response);
    
    case "P2025":
      response.error = "Not Found";
      response.message = "The requested resource was not found";
      return res.status(404).json(response);
    
    case "P2003":
      response.error = "Foreign Key Constraint";
      response.message = "Related resource not found";
      return res.status(400).json(response);
    
    case "P2014":
      response.error = "Invalid ID";
      response.message = "Invalid ID provided";
      return res.status(400).json(response);
    
    case "P2021":
      response.error = "Table Not Found";
      response.message = "Database table does not exist";
      return res.status(500).json(response);
    
    case "P2022":
      response.error = "Column Not Found";
      response.message = "Database column does not exist";
      return res.status(500).json(response);
    
    case "P2024":
      response.error = "Connection Timeout";
      response.message = "Database connection timed out";
      return res.status(500).json(response);
    
    default:
      response.message = process.env.NODE_ENV === "production"
        ? "Database operation failed"
        : error.message;
      return res.status(500).json(response);
  }
};
