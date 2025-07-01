import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { AuthService } from "../services/authService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
import { z } from "zod";

const userService = new UserService();
const authService = new AuthService();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  profileImage: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const updateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  offerUpdates: z.boolean().optional(),
  priceAlerts: z.boolean().optional(),
  eventReminders: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

const verifyEmailSchema = z.object({
  email: z.string().email().optional(),
});

/**
 * Get user profile
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const profile = await userService.getProfile(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    logger.error("Get profile error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const validatedData = updateProfileSchema.parse(req.body);
    const profile = await userService.updateProfile(userId, validatedData);
    res.json({
      success: true,
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    logger.error("Update profile error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Change password
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const validatedData = changePasswordSchema.parse(req.body);
    const result = await userService.changePassword(userId, validatedData);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Change password error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    // In a real app, you'd upload to S3/Cloudinary and get the URL
    const imageUrl = `/uploads/${req.file.filename}`;

    const profile = await userService.updateProfile(userId, {
      profileImage: imageUrl,
    });
    res.json({
      success: true,
      data: { profileImage: imageUrl },
      message: "Profile image uploaded successfully",
    });
  } catch (error: any) {
    logger.error("Upload profile image error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get profile statistics
 */
export const getProfileStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const stats = await userService.getProfileStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error("Get profile stats error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const settings = await userService.getNotificationSettings(userId);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    logger.error("Get notification settings error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const validatedData = updateNotificationSettingsSchema.parse(req.body);
    const settings = await userService.updateNotificationSettings(userId, validatedData);
    res.json({
      success: true,
      data: settings,
      message: "Notification settings updated successfully",
    });
  } catch (error: any) {
    logger.error("Update notification settings error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete account
 */
export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const result = await userService.deleteAccount(userId);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Delete account error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Request email verification
 */
export const requestEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const validatedData = verifyEmailSchema.parse(req.body);
    
    // Get user's current email if not provided
    let email = validatedData.email;
    if (!email) {
      const user = await userService.getProfile(userId);
      email = user.email;
    }
    
    const result = await userService.requestEmailVerification(userId, email);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Request email verification error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};