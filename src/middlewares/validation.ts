import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Invalid request body",
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
