import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Mail, Phone, Calendar, Shield, Activity, Settings, Camera, Bell, DollarSign, Package, TrendingUp, Users, Handshake, Star } from 'lucide-react';
import { profileService, type UserProfile, type ProfileStats } from '../../services/profileService';
import { ProfileSettings } from './ProfileSettings';
import { NotificationSettings } from './NotificationSettings';
import { sellerService } from '../../services/sellerService';
import { buyerService } from '../../services/buyerService';

type TabType = 'overview' | 'settings' | 'notifications' | 'stats';

export const BrokerProfile = () => {
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

  // Get broker-specific stats (combination of buying and selling)
  const { data: brokerStats, isLoading: brokerStatsLoading } = useQuery({
    queryKey: ['broker-stats'],
    queryFn: async () => {
      try {
        const [listings, offers] = await Promise.all([
          sellerService.getListings({ limit: 1000 }),
          buyerService.getOffers({ limit: 1000 }),
        ]);
        
        return {
          totalListings: listings.data.length,
          activeListings: listings.data.filter(l => l.status === 'ACTIVE' || l.status === 'AVAILABLE').length,
          soldListings: listings.data.filter(l => l.status === 'SOLD').length,
          totalRevenue: listings.data
            .filter(l => l.status === 'SOLD')
            .reduce((sum, l) => sum + (l.price * l.quantity), 0),
          totalOffers: offers.data.length,
          activeOffers: offers.data.filter(o => o.status === 'ACTIVE').length,
          acceptedOffers: offers.data.filter(o => o.status === 'ACCEPTED').length,
          totalSpent: offers.data
            .filter(o => o.status === 'ACCEPTED')
            .reduce((sum, o) => sum + (o.maxPrice * o.quantity), 0),
          recentActivity: [
            ...listings.data.slice(0, 3).map(l => ({
              id: l.id,
              type: 'listing',
              description: `Listed ${l.event.name} tickets`,
              date: l.createdAt,
              amount: l.price * l.quantity,
            })),
            ...offers.data.slice(0, 3).map(o => ({
              id: o.id,
              type: 'offer',
              description: `Made offer for ${o.event.name}`,
              date: o.createdAt,
              amount: o.maxPrice * o.quantity,
            })),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
        };
      } catch (error) {
        console.error('Error fetching broker stats:', error);
        return {
          totalListings: 0,
          activeListings: 0,
          soldListings: 0,
          totalRevenue: 0,
          totalOffers: 0,
          activeOffers: 0,
          acceptedOffers: 0,
          totalSpent: 0,
          recentActivity: [],
        };
      }
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
        <h1 className="text-3xl font-bold text-gray-900">Broker Profile</h1>
        <p className="text-gray-600 mt-2">Manage your broker account and track your marketplace activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <Card className="mb-6">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
                <Handshake className="h-4 w-4 mr-1" />
                {profile?.role.toLowerCase()}
              </p>
              
              <div className="flex items-center justify-center mt-3">
                {profile?.isEmailVerified ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Verified Broker
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
                          ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
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

              {/* Broker Performance */}
              {!brokerStatsLoading && brokerStats && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Broker Performance</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Selling Stats */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Package className="h-5 w-5 mr-2 text-green-600" />
                          Selling Activity
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Listings</span>
                            <span className="font-medium">{brokerStats.totalListings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Active Listings</span>
                            <span className="font-medium text-green-600">{brokerStats.activeListings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Sold Listings</span>
                            <span className="font-medium text-blue-600">{brokerStats.soldListings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Revenue</span>
                            <span className="font-medium text-emerald-600">{formatPrice(brokerStats.totalRevenue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Buying Stats */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          Buying Activity
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Offers</span>
                            <span className="font-medium">{brokerStats.totalOffers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Active Offers</span>
                            <span className="font-medium text-yellow-600">{brokerStats.activeOffers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Accepted Offers</span>
                            <span className="font-medium text-purple-600">{brokerStats.acceptedOffers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Spent</span>
                            <span className="font-medium text-red-600">{formatPrice(brokerStats.totalSpent)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPrice(brokerStats.totalRevenue - brokerStats.totalSpent)}
                          </div>
                          <div className="text-sm text-gray-500">Net Profit</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {brokerStats.totalListings + brokerStats.totalOffers}
                          </div>
                          <div className="text-sm text-gray-500">Total Transactions</div>
                        </div>
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
              {brokerStats?.recentActivity && brokerStats.recentActivity.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                    
                    <div className="space-y-4">
                      {brokerStats.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {activity.type === 'listing' ? (
                                <Package className="h-5 w-5 text-green-500" />
                              ) : (
                                <Users className="h-5 w-5 text-blue-500" />
                              )}
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
                            {formatPrice(activity.amount)}
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Statistics</h2>
                
                {brokerStatsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Revenue</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(brokerStats?.totalRevenue || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-red-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Spent</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatPrice(brokerStats?.totalSpent || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Package className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Listings</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {brokerStats?.totalListings || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Offers</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {brokerStats?.totalOffers || 0}
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