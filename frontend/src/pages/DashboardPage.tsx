import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { Calendar, DollarSign, TrendingUp, Users, Activity, Zap, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminStats = [
    {
      name: 'Total Revenue',
      value: '$48,952',
      icon: DollarSign,
      change: '+12.3%',
      changeType: 'increase',
    },
    {
      name: 'Active Users',
      value: '2,847',
      icon: Users,
      change: '+8.1%',
      changeType: 'increase',
    },
    {
      name: 'Total Events',
      value: '156',
      icon: Calendar,
      change: '+5.2%',
      changeType: 'increase',
    },
    {
      name: 'Conversion Rate',
      value: '94.5%',
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'increase',
    },
  ];

  const getDashboardContent = () => {
    switch (user?.role) {
      case UserRole.BUYER:
        return (
          <div className="space-y-8">
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Offers</p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-600">3</p>
                      <p className="text-xs text-slate-500">2 expiring soon</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Purchases</p>
                      <p className="text-2xl md:text-3xl font-bold text-slate-900">8</p>
                      <p className="text-xs text-slate-500">This month</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Spent</p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-600">$2,450</p>
                      <p className="text-xs text-slate-500">Last 30 days</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <h3 className="text-lg md:text-xl font-bold text-slate-900">Quick Actions</h3>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Button 
                    variant="primary" 
                    className="justify-start h-auto p-3 md:p-4"
                    onClick={() => navigate('/events')}
                  >
                    <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                    <div className="text-left">
                      <div className="font-semibold text-sm md:text-base">Create New Offer</div>
                      <div className="text-xs md:text-sm opacity-90">Find tickets for your next event</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-3 md:p-4"
                    onClick={() => navigate('/events')}
                  >
                    <Activity className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                    <div className="text-left">
                      <div className="font-semibold text-sm md:text-base">Browse Events</div>
                      <div className="text-xs md:text-sm text-slate-600">Discover upcoming shows</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case UserRole.SELLER:
        return (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Listings</p>
                      <p className="text-3xl font-bold text-blue-600">12</p>
                      <p className="text-xs text-slate-500">3 with offers</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Sales</p>
                      <p className="text-3xl font-bold text-slate-900">24</p>
                      <p className="text-xs text-slate-500">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Revenue</p>
                      <p className="text-3xl font-bold text-blue-600">$5,230</p>
                      <p className="text-xs text-slate-500">Last 30 days</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="primary" className="justify-start h-auto p-4">
                    <Zap className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">List New Tickets</div>
                      <div className="text-sm opacity-90">Add tickets to your inventory</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Activity className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">View Analytics</div>
                      <div className="text-sm text-slate-600">Track your performance</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case UserRole.ADMIN:
        return (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {adminStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-blue-600 font-medium text-sm">{stat.change}</span>
                            <span className="text-slate-500 ml-1 text-sm">from last month</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New user registration', time: '2 minutes ago', type: 'user' },
                      { action: 'Ticket sale completed', time: '5 minutes ago', type: 'sale' },
                      { action: 'Event created', time: '10 minutes ago', type: 'event' },
                      { action: 'Payment processed', time: '15 minutes ago', type: 'payment' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button variant="primary" className="justify-start">
                      <Users className="h-4 w-4 mr-3" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Calendar className="h-4 w-4 mr-3" />
                      Create Event
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <TrendingUp className="h-4 w-4 mr-3" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Activity className="h-4 w-4 mr-3" />
                      System Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Welcome to AutoMatch!</h3>
              <p className="text-slate-600">Your dashboard will appear here once you set up your account.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            Here's what's happening with your account today.
          </p>
        </div>

        {getDashboardContent()}
      </div>
    </div>
  );
};