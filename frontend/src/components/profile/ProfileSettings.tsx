import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { profileService, type UserProfile, type UpdateProfileRequest, type ChangePasswordRequest } from '../../services/profileService';
import { Mail, Phone, User, Lock, Trash2, AlertTriangle } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ProfileSettingsProps {
  profile?: UserProfile;
}

export const ProfileSettings = ({ profile }: ProfileSettingsProps) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const queryClient = useQueryClient();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileService.changePassword(data),
    onSuccess: () => {
      resetPasswordForm();
      setShowPasswordForm(false);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: () => profileService.requestEmailVerification(),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => profileService.deleteAccount(),
    onSuccess: () => {
      // Redirect to login or handle account deletion
      window.location.href = '/login';
    },
  });

  const onProfileSubmit = async (data: UpdateProfileRequest) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordRequest) => {
    try {
      await changePasswordMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleEmailVerification = async () => {
    try {
      await verifyEmailMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccountMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  First Name
                </label>
                <Input
                  {...registerProfile('firstName')}
                  error={profileErrors.firstName?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Last Name
                </label>
                <Input
                  {...registerProfile('lastName')}
                  error={profileErrors.lastName?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                <Input
                  {...registerProfile('phone')}
                  placeholder="(555) 123-4567"
                  error={profileErrors.phone?.message}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div>
                {!profile?.isEmailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEmailVerification}
                    disabled={verifyEmailMutation.isPending}
                    className="mr-4"
                  >
                    {verifyEmailMutation.isPending ? 'Sending...' : 'Verify Email'}
                  </Button>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
          
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">
                  Keep your account secure with a strong password
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  error={passwordErrors.confirmPassword?.message}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    resetPasswordForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-6">Danger Zone</h2>
          
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700 mt-1">
                  Once you delete your account, there is no going back. Please be certain.
                  All your offers, transactions, and data will be permanently removed.
                </p>
                
                <div className="mt-4">
                  {!showDeleteConfirmation ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-900">
                        Are you absolutely sure? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={deleteAccountMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirmation(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};