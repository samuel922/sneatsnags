import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Mail, Phone, Calendar, Shield, Activity, Settings, Camera, Bell, DollarSign, Package, TrendingUp, Users, Crown, BarChart3, AlertTriangle, Check } from 'lucide-react';
import { profileService, type UserProfile, type ProfileStats } from '../../services/profileService';
import { ProfileSettings } from './ProfileSettings';
import { NotificationSettings } from './NotificationSettings';

type TabType = 'overview' | 'settings' | 'notifications' | 'stats';

export const AdminProfile = () => {
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

  // Get admin-specific stats
  const { data: adminStats, isLoading: adminStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Mock admin stats - in real app, this would come from admin API
      return {
        totalUsers: 1234,
        activeUsers: 856,
        totalListings: 5678,
        activeListings: 3456,
        totalOffers: 2345,
        activeOffers: 1234,
        totalTransactions: 890,
        completedTransactions: 756,
        totalRevenue: 125000,
        platformFees: 12500,
        systemHealth: 98.5,
        pendingReports: 5,
        resolvedReports: 145,
        recentActivity: [
          {
            id: '1',
            type: 'user',
            description: 'New user registration',
            date: new Date().toISOString(),
            details: 'john.doe@example.com',
          },
          {
            id: '2',
            type: 'transaction',
            description: 'Transaction completed',
            date: new Date(Date.now() - 3600000).toISOString(),
            details: '$250.00',
          },
          {
            id: '3',
            type: 'report',
            description: 'Support ticket resolved',
            date: new Date(Date.now() - 7200000).toISOString(),
            details: 'Ticket #1234',
          },
          {
            id: '4',
            type: 'listing',
            description: 'New listing created',
            date: new Date(Date.now() - 10800000).toISOString(),
            details: 'Concert tickets',
          },
          {
            id: '5',
            type: 'system',
            description: 'System backup completed',
            date: new Date(Date.now() - 14400000).toISOString(),
            details: 'Daily backup',
          },
        ],
      };
    },
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'stats' as TabType, label: 'Platform Stats', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'transaction':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'report':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'listing':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-2">Platform administration and system management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <Card className="mb-6">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
              <p className="text-gray-500 capitalize flex items-center justify-center">
                <Crown className="h-4 w-4 mr-1" />
                {profile?.role.toLowerCase()}
              </p>
              
              <div className="flex items-center justify-center mt-3">
                <div className="flex items-center text-red-600 text-sm">
                  <Shield className="h-4 w-4 mr-1" />
                  System Administrator
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Admin since {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</p>
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
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Administrator Information</h2>
                  
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
                        <p className="text-sm font-medium text-gray-900">Admin Email</p>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact Number</p>
                        <p className="text-sm text-gray-500">
                          {profile?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admin Since</p>
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

              {/* System Overview */}
              {!adminStatsLoading && adminStats && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Check className="h-8 w-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">System Health</p>
                            <p className="text-2xl font-bold text-green-600">
                              {adminStats.systemHealth}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Active Users</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatNumber(adminStats.activeUsers)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Pending Reports</p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {adminStats.pendingReports}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Metrics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Users</span>
                            <span className="font-medium">{formatNumber(adminStats.totalUsers)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Listings</span>
                            <span className="font-medium">{formatNumber(adminStats.totalListings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Offers</span>
                            <span className="font-medium">{formatNumber(adminStats.totalOffers)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Completed Transactions</span>
                            <span className="font-medium text-green-600">{formatNumber(adminStats.completedTransactions)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Revenue</span>
                            <span className="font-medium">{formatPrice(adminStats.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Platform Fees</span>
                            <span className="font-medium text-emerald-600">{formatPrice(adminStats.platformFees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Reports Resolved</span>
                            <span className="font-medium text-blue-600">{formatNumber(adminStats.resolvedReports)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('stats')}
                        className="w-full sm:w-auto"
                      >
                        View Platform Statistics
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recent System Activity */}
              {adminStats?.recentActivity && adminStats.recentActivity.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent System Activity</h2>
                    
                    <div className="space-y-4">
                      {adminStats.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(activity.date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.details}
                          </div>
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
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Statistics</h2>
                
                {adminStatsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Users</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatNumber(adminStats?.totalUsers || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Package className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Listings</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatNumber(adminStats?.totalListings || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(adminStats?.totalRevenue || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Transactions</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {formatNumber(adminStats?.completedTransactions || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};