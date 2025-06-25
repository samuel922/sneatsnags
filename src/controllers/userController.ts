import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { prisma } from "../utils/prisma";
import { updateProfileSchema, updateRoleSchema } from "../utils/validations";
import { AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";

const userService = new UserService(prisma);

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await userService.getUserProfile(req.user!.id);
    res.json(profile);
  } catch (error: any) {
    logger.error("Get profile error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const profile = await userService.updateUserProfile(req.user!.id, data);
    res.json(profile);
  } catch (error: any) {
    logger.error("Update profile error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, role } = updateRoleSchema.parse({
      ...req.body,
      userId: req.params.id,
    });
    const user = await userService.updateUserRole(userId, role);
    res.json(user);
  } catch (error: any) {
    logger.error("Update role error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const notifications = await userService.getNotifications(
      req.user!.id,
      req.query
    );
    res.json(notifications);
  } catch (error: any) {
    logger.error("Get notifications error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    await userService.markNotificationAsRead(req.user!.id, req.params.id);
    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    logger.error("Mark notification read error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    await userService.markAllNotificationsAsRead(req.user!.id);
    res.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    logger.error("Mark all notifications read error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    await userService.deleteUserAccount(req.user!.id);
    res.json({ message: "Account deleted" });
  } catch (error: any) {
    logger.error("Delete account error:", error);
    res.status(400).json({ error: error.message });
  }
};
