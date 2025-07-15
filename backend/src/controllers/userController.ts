import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
import { z } from "zod";

const userService = new UserService();

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
    next(error);
  }
};

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
    next(error);
  }
};

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
    next(error);
  }
};

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
    next(error);
  }
};

export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const stats = await userService.getDashboardStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error("Get dashboard error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const notifications = await userService.getNotifications(
      userId,
      page,
      limit
    );
    res.json({
      success: true,
      data: notifications.data,
      pagination: notifications.pagination,
    });
  } catch (error: any) {
    logger.error("Get notifications error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;
    const result = await userService.markNotificationAsRead(
      userId,
      notificationId
    );
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Mark notification as read error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const result = await userService.markAllNotificationsAsRead(userId);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Mark all notifications as read error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

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
