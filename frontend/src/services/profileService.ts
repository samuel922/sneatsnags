import { api } from './api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileStats {
  totalOffers: number;
  activeOffers: number;
  acceptedOffers: number;
  totalSpent: number;
  averageOfferPrice: number;
  favoriteCategories: Array<{
    category: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'offer_created' | 'offer_accepted' | 'offer_cancelled' | 'payment_completed';
    description: string;
    date: string;
    amount?: number;
  }>;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  offerUpdates: boolean;
  priceAlerts: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/profile');
    return response.data;
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put('/profile', updates);
    return response.data;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await api.post('/profile/change-password', passwordData);
  }

  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await api.post('/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  }

  async getProfileStats(): Promise<ProfileStats> {
    const response = await api.get('/profile/stats');
    return response.data;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get('/profile/notifications');
    return response.data;
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const response = await api.put('/profile/notifications', settings);
    return response.data;
  }

  async deleteAccount(): Promise<void> {
    await api.delete('/profile');
  }

  async requestEmailVerification(): Promise<void> {
    await api.post('/profile/verify-email');
  }
}

export const profileService = new ProfileService();