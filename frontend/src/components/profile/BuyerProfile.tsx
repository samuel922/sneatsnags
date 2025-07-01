import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Mail, Phone, Calendar, Shield, Activity, Settings, Camera, Bell } from 'lucide-react';
import { profileService, type UserProfile, type ProfileStats } from '../../services/profileService';
import { ProfileSettings } from './ProfileSettings';
import { ProfileStats as ProfileStatsComponent } from './ProfileStats';
import { NotificationSettings } from './NotificationSettings';

type TabType = 'overview' | 'settings' | 'notifications' | 'stats';

export const BuyerProfile = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showImageUpload, setShowImageUpload] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ProfileStats>({
    queryKey: ['profile-stats'],
    queryFn: () => profileService.getProfileStats(),
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await profileService.uploadProfileImage(file);
      // Refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'stats' as TabType, label: 'Statistics', icon: Activity },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ];

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <Card className="mb-6">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(profile?.firstName, profile?.lastName)
                  )}
                </div>
                <button
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
                {showImageUpload && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <p className="text-gray-500 capitalize">{profile?.role.toLowerCase()}</p>
              
              <div className="flex items-center justify-center mt-3">
                {profile?.isEmailVerified ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Verified Account
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 text-sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Unverified
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Member since {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</p>
                {profile?.lastLoginAt && (
                  <p>Last active {formatDate(profile.lastLoginAt)}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <Card>
            <div className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Full Name</p>
                        <p className="text-sm text-gray-500">
                          {profile?.firstName} {profile?.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Address</p>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone Number</p>
                        <p className="text-sm text-gray-500">
                          {profile?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-500">
                          {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      onClick={() => setActiveTab('settings')}
                      className="w-full sm:w-auto"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              {!statsLoading && stats && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.totalOffers}
                        </div>
                        <div className="text-sm text-gray-500">Total Offers</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.activeOffers}
                        </div>
                        <div className="text-sm text-gray-500">Active Offers</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.acceptedOffers}
                        </div>
                        <div className="text-sm text-gray-500">Accepted</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          ${stats.totalSpent.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Spent</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('stats')}
                        className="w-full sm:w-auto"
                      >
                        View Detailed Statistics
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recent Activity */}
              {stats?.recentActivity && stats.recentActivity.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                    
                    <div className="space-y-4">
                      {stats.recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <Activity className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(activity.date)}
                            </p>
                          </div>
                          {activity.amount && (
                            <div className="text-sm font-medium text-gray-900">
                              ${activity.amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <ProfileSettings profile={profile} />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings />
          )}

          {activeTab === 'stats' && (
            <ProfileStatsComponent stats={stats} isLoading={statsLoading} />
          )}
        </div>
      </div>
    </div>
  );
};