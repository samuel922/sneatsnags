import { apiClient } from './api';
import type { PaginatedResponse, QueryParams } from '../types/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  email: {
    offers: boolean;
    transactions: boolean;
    events: boolean;
    marketing: boolean;
  };
  push: {
    offers: boolean;
    transactions: boolean;
    events: boolean;
  };
  sms: {
    critical: boolean;
    transactions: boolean;
  };
}

export const notificationService = {
  // Get user notifications
  async getNotifications(params?: QueryParams & { 
    isRead?: boolean; 
    type?: string; 
  }): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', params);
    return response.data!;
  },

  // Get unread notification count
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: { count: number } }>('/users/notifications/unread-count');
      if (response.data && response.data.data && typeof response.data.data.count === 'number') {
        return response.data.data;
      }
      // Return default if response structure is unexpected
      return { count: 0 };
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      return { count: 0 };
    }
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.post<Notification>(`/notifications/${id}/read`);
    return response.data!;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Clear all notifications
  async clearAll(): Promise<void> {
    await apiClient.delete('/notifications');
  },

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data!;
  },

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiClient.put<NotificationPreferences>('/notifications/preferences', preferences);
    return response.data!;
  },

  // Test notification (for development)
  async sendTestNotification(): Promise<void> {
    await apiClient.post('/notifications/test');
  },
};