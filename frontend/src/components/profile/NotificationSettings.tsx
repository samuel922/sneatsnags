import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Bell, Mail, MessageCircle, DollarSign, Calendar, Megaphone, Shield } from 'lucide-react';
import { profileService, type NotificationSettings as NotificationSettingsType } from '../../services/profileService';

export const NotificationSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettingsType>({
    emailNotifications: true,
    smsNotifications: false,
    offerUpdates: true,
    priceAlerts: true,
    eventReminders: true,
    marketingEmails: false,
  });

  const { data: notificationSettings, isLoading } = useQuery<NotificationSettingsType>({
    queryKey: ['notification-settings'],
    queryFn: () => profileService.getNotificationSettings(),
  });

  // Update local settings when data is fetched
  React.useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    }
  }, [notificationSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: NotificationSettingsType) => 
      profileService.updateNotificationSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });

  const handleSettingChange = (key: keyof NotificationSettingsType, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync(settings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const notificationOptions = [
    {
      key: 'emailNotifications' as keyof NotificationSettingsType,
      title: 'Email Notifications',
      description: 'Receive general notifications via email',
      icon: Mail,
      category: 'General',
    },
    {
      key: 'smsNotifications' as keyof NotificationSettingsType,
      title: 'SMS Notifications',
      description: 'Receive important notifications via SMS',
      icon: MessageCircle,
      category: 'General',
    },
    {
      key: 'offerUpdates' as keyof NotificationSettingsType,
      title: 'Offer Updates',
      description: 'Get notified when your offers are accepted, countered, or expired',
      icon: Bell,
      category: 'Offers',
    },
    {
      key: 'priceAlerts' as keyof NotificationSettingsType,
      title: 'Price Alerts',
      description: 'Receive alerts when ticket prices change for events you\'re interested in',
      icon: DollarSign,
      category: 'Offers',
    },
    {
      key: 'eventReminders' as keyof NotificationSettingsType,
      title: 'Event Reminders',
      description: 'Get reminders about upcoming events you have tickets for',
      icon: Calendar,
      category: 'Events',
    },
    {
      key: 'marketingEmails' as keyof NotificationSettingsType,
      title: 'Marketing Emails',
      description: 'Receive promotional emails about new events and special offers',
      icon: Megaphone,
      category: 'Marketing',
    },
  ];

  const groupedOptions = notificationOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, typeof notificationOptions>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          <p className="text-gray-600">
            Manage how and when you receive notifications from AutoMatch Tickets.
            You can always change these settings later.
          </p>
        </div>
      </Card>

      {/* Notification Settings by Category */}
      {Object.entries(groupedOptions).map(([category, options]) => (
        <Card key={category}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
            
            <div className="space-y-6">
              {options.map((option) => {
                const Icon = option.icon;
                const isEnabled = settings[option.key];
                
                return (
                  <div key={option.key} className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isEnabled ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isEnabled ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center ml-4">
                      <button
                        onClick={() => handleSettingChange(option.key, !isEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ))}

      {/* Privacy Notice */}
      <Card>
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Privacy Notice</h3>
              <p className="text-sm text-gray-500 mt-1">
                We respect your privacy and will never share your contact information with third parties.
                You can opt out of any notifications at any time by updating these preferences or
                clicking the unsubscribe link in our emails.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="w-full sm:w-auto"
        >
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const allEnabled = {
                  emailNotifications: true,
                  smsNotifications: true,
                  offerUpdates: true,
                  priceAlerts: true,
                  eventReminders: true,
                  marketingEmails: true,
                };
                setSettings(allEnabled);
              }}
              className="w-full"
            >
              Enable All Notifications
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const allDisabled = {
                  emailNotifications: false,
                  smsNotifications: false,
                  offerUpdates: false,
                  priceAlerts: false,
                  eventReminders: false,
                  marketingEmails: false,
                };
                setSettings(allDisabled);
              }}
              className="w-full"
            >
              Disable All Notifications
            </Button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              <strong>Note:</strong> Some critical notifications (like security alerts and 
              transaction confirmations) cannot be disabled for your account security.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};