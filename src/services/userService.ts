import { PrismaClient, User, Notification } from "@prisma/client";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async getUserProfile(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        password: false,
        profileImage: true,
        stripeCustomerId: true,
        stripeAccountId: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async updateUserProfile(userId: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any, updatedAt: new Date() },
    });
  }

  async getNotifications(userId: string, query: any) {
    const { page, limit, skip } = getPaginationParams(query);
    const where = { userId, ...(query.unread === "true" && { isRead: false }) };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return createPaginationResult(notifications, total, page, limit);
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async deleteUserAccount(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, updatedAt: new Date() },
    });
  }
}
