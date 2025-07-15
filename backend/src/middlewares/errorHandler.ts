import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: error.errors,
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  // Prisma error handling
  if (error.code === "P2002") {
    return res.status(400).json({ error: "Duplicate entry" });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  if (error.code === "P2003") {
    return res.status(400).json({ error: "Foreign key constraint failed" });
  }

  if (error.code === "P2014") {
    return res.status(400).json({ error: "Invalid ID provided" });
  }

  if (error.code === "P2021") {
    return res.status(500).json({ error: "Table does not exist" });
  }

  if (error.code === "P2022") {
    return res.status(500).json({ error: "Column does not exist" });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
  });
};
