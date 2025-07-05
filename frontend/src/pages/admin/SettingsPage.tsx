import React, { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Bell,
  Shield,
  Database,
  Zap,
  Save,
  RefreshCw,
  AlertTriangle,
  Download,
  Trash2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminService, type SystemSettings } from '../../services/adminService';
import { SweetAlert } from '../../utils/sweetAlert';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('platform');
  const [hasChanges, setHasChanges] = useState(false);

  const sections: ConfigSection[] = [
    {
      id: 'platform',
      title: 'Platform Settings',
      description: 'General platform configuration and fees',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: 'payment',
      title: 'Payment Settings',
      description: 'Payment processing and payout configuration',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email, SMS, and push notification settings',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Authentication and security policies',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Third-party service integrations',
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'System maintenance and backup settings',
      icon: <Database className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      SweetAlert.error('Failed to load settings', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      setHasChanges(false);
      SweetAlert.success('Settings saved', 'Your changes have been saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      SweetAlert.error('Failed to save settings', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };


  const exportSettings = async () => {
    try {
      SweetAlert.loading('Exporting settings', 'Please wait...');
      const result = await adminService.exportData({ type: 'settings' });
      SweetAlert.success('Export ready', 'Settings export is ready for download');
      window.open(result.url, '_blank');
    } catch (error) {
      SweetAlert.error('Export failed', 'Unable to export settings');
    }
  };

  const resetToDefaults = async () => {
    const confirmed = await SweetAlert.confirm(
      'Reset to defaults?',
      'This will reset all settings to their default values. This action cannot be undone.'
    );

    if (confirmed) {
      // Mock default settings - in real app, this would come from your API
      const defaultSettings: SystemSettings = {
        platform: {
          commissionRate: 5.0,
          maxListingDuration: 30,
          minOfferAmount: 1.0,
          maxRefundDays: 7,
        },
        payment: {
          stripeEnabled: true,
          autoPayoutEnabled: false,
          payoutSchedule: 'weekly',
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
        },
        security: {
          twoFactorRequired: false,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
        },
      };

      setSettings(defaultSettings);
      setHasChanges(true);
      SweetAlert.success('Settings reset', 'All settings have been reset to defaults');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="lg:col-span-3 h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <Button onClick={fetchSettings} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportSettings} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={resetToDefaults} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveSettings} disabled={!hasChanges || saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.icon}
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* Platform Settings */}
          {activeSection === 'platform' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Configuration</h3>
                <p className="text-gray-600">Configure general platform settings and commission rates</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings?.platform.commissionRate || 0}
                    onChange={(e) => updateSetting('platform', 'commissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Platform commission on transactions</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Listing Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings?.platform.maxListingDuration || 0}
                    onChange={(e) => updateSetting('platform', 'maxListingDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum duration for ticket listings</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Offer Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings?.platform.minOfferAmount || 0}
                    onChange={(e) => updateSetting('platform', 'minOfferAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum amount for offers</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Refund Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings?.platform.maxRefundDays || 0}
                    onChange={(e) => updateSetting('platform', 'maxRefundDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Days after purchase to allow refunds</p>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Settings */}
          {activeSection === 'payment' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Configuration</h3>
                <p className="text-gray-600">Configure payment processing and payout settings</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Stripe Integration</h4>
                    <p className="text-sm text-gray-600">Enable Stripe payment processing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.payment.stripeEnabled || false}
                      onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto Payouts</h4>
                    <p className="text-sm text-gray-600">Automatically process seller payouts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.payment.autoPayoutEnabled || false}
                      onChange={(e) => updateSetting('payment', 'autoPayoutEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Schedule
                  </label>
                  <select
                    value={settings?.payment.payoutSchedule || 'weekly'}
                    onChange={(e) => updateSetting('payment', 'payoutSchedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">How often to process automatic payouts</p>
                </div>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
                <p className="text-gray-600">Configure email, SMS, and push notification preferences</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Send email notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.notifications.emailEnabled || false}
                      onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Send SMS notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.notifications.smsEnabled || false}
                      onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Send push notifications to mobile apps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.notifications.pushEnabled || false}
                      onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Configuration</h3>
                <p className="text-gray-600">Configure authentication and security policies</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Require 2FA for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.security.twoFactorRequired || false}
                      onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={settings?.security.sessionTimeout || 0}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Automatic logout after inactivity</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings?.security.maxLoginAttempts || 0}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Lock account after failed attempts</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Additional sections would go here */}
          {activeSection === 'integrations' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-party Integrations</h3>
                <p className="text-gray-600">Configure external service integrations</p>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Integration settings coming soon</p>
              </div>
            </Card>
          )}

          {activeSection === 'maintenance' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Maintenance</h3>
                <p className="text-gray-600">Configure backup and maintenance settings</p>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Maintenance settings coming soon</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};