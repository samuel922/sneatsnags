import { prisma } from "../utils/prisma";
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserPreferences,
} from "../types/user";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        profileImage: true,
        stripeCustomerId: true,
        stripeAccountId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileRequest) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    logger.info(`Profile updated for user: ${userId}`);
    return user;
  }

  async changePassword(userId: string, data: ChangePasswordRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(
      data.currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${userId}`);
    return { message: "Password changed successfully" };
  }

  async deleteAccount(userId: string) {
    // Check for active transactions
    const activeTransactions = await prisma.transaction.count({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    });

    if (activeTransactions > 0) {
      throw new Error("Cannot delete account with active transactions");
    }

    // Soft delete by deactivating account
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    logger.info(`Account deactivated for user: ${userId}`);
    return { message: "Account deleted successfully" };
  }

  async getDashboardStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const stats: any = {};

    if (user.role === "BUYER" || user.role === "ADMIN") {
      stats.buyer = {
        activeOffers: await prisma.offer.count({
          where: { buyerId: userId, status: "ACTIVE" },
        }),
        acceptedOffers: await prisma.offer.count({
          where: { buyerId: userId, status: "ACCEPTED" },
        }),
        totalSpent: await prisma.transaction.aggregate({
          where: { buyerId: userId, status: "COMPLETED" },
          _sum: { amount: true },
        }),
      };
    }

    if (
      user.role === "SELLER" ||
      user.role === "BROKER" ||
      user.role === "ADMIN"
    ) {
      stats.seller = {
        activeListings: await prisma.listing.count({
          where: { sellerId: userId, status: "AVAILABLE" },
        }),
        soldListings: await prisma.listing.count({
          where: { sellerId: userId, status: "SOLD" },
        }),
        totalEarned: await prisma.transaction.aggregate({
          where: {
            listing: { sellerId: userId },
            status: "COMPLETED",
          },
          _sum: { sellerAmount: true },
        }),
      };
    }

    if (user.role === "BROKER" || user.role === "ADMIN") {
      stats.broker = {
        integrations: await prisma.brokerIntegration.count({
          where: { userId, isActive: true },
        }),
        lastSyncSuccess: await prisma.brokerIntegration.count({
          where: { userId, lastSyncStatus: "SYNCED" },
        }),
        syncErrors: await prisma.brokerIntegration.count({
          where: { userId, lastSyncStatus: "FAILED" },
        }),
      };
    }

    return stats;
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return { message: "Notification marked as read" };
  }

  async markAllNotificationsAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { message: "All notifications marked as read" };
  }
}
