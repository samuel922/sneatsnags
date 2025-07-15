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
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the event for analytics
  logger.info("User logged out");
  res.json({ message: "Logged out successfully" });
};
