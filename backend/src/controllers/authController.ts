import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../utils/validations";
import { logger } from "../utils/logger";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result
    });
  } catch (error: any) {
    logger.error("Registration error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    res.json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error: any) {
    logger.error("Login error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(401).json({ error: error.message });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = verifyEmailSchema.parse(req.query);
    const result = await authService.verifyEmail(validatedData.token);
    res.json(result);
  } catch (error: any) {
    logger.error("Email verification error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(validatedData.email);
    res.json(result);
  } catch (error: any) {
    logger.error("Forgot password error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(
      validatedData.token,
      validatedData.password
    );
    res.json(result);
  } catch (error: any) {
    logger.error("Reset password error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the event for analytics
  logger.info("User logged out");
  res.json({ message: "Logged out successfully" });
};
