import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  AlertCircle,
  Activity,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { adminService, type AdminDashboardStats } from '../services/adminService';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchDashboardStats}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatNumber(stats.users.total) : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats ? formatNumber(stats.users.activeThisMonth) : '0'} active this month
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex space-x-4 text-sm">
            <div>
              <span className="text-gray-500">Buyers:</span>{' '}
              <span className="font-medium">{stats ? formatNumber(stats.users.buyers) : '0'}</span>
            </div>
            <div>
              <span className="text-gray-500">Sellers:</span>{' '}
              <span className="font-medium">{stats ? formatNumber(stats.users.sellers) : '0'}</span>
            </div>
          </div>
        </Card>

        {/* Events Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatNumber(stats.events.total) : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats ? formatNumber(stats.events.upcoming) : '0'} upcoming
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Transactions Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatNumber(stats.transactions.total) : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats ? formatNumber(stats.transactions.pending) : '0'} pending
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Revenue Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.transactions.revenue) : '$0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Volume: {stats ? formatCurrency(stats.transactions.volume) : '$0'}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* User Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <UserCheck className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <Link 
              to="/admin/users" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-600">View and manage all platform users</div>
            </Link>
            <Link 
              to="/admin/users?role=BUYER" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Buyers</div>
              <div className="text-sm text-gray-600">{stats ? formatNumber(stats.users.buyers) : '0'} registered buyers</div>
            </Link>
            <Link 
              to="/admin/users?role=SELLER" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Sellers</div>
              <div className="text-sm text-gray-600">{stats ? formatNumber(stats.users.sellers) : '0'} registered sellers</div>
            </Link>
          </div>
        </Card>

        {/* Event Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <Link 
              to="/admin/events" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">All Events</div>
              <div className="text-sm text-gray-600">Manage platform events</div>
            </Link>
            <Link 
              to="/admin/events/create" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Create Event</div>
              <div className="text-sm text-gray-600">Add new events to platform</div>
            </Link>
            <Link 
              to="/admin/events?status=upcoming" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Upcoming Events</div>
              <div className="text-sm text-gray-600">{stats ? formatNumber(stats.events.upcoming) : '0'} events scheduled</div>
            </Link>
          </div>
        </Card>

        {/* Transaction Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <Link 
              to="/admin/transactions" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">All Transactions</div>
              <div className="text-sm text-gray-600">View and manage all transactions</div>
            </Link>
            <Link 
              to="/admin/transactions?status=pending" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Pending</div>
              <div className="text-sm text-gray-600">{stats ? formatNumber(stats.transactions.pending) : '0'} pending transactions</div>
            </Link>
            <Link 
              to="/admin/refunds" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Refunds</div>
              <div className="text-sm text-gray-600">Process refund requests</div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/admin/analytics" 
          className="group p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            <div>
              <div className="font-semibold">Analytics</div>
              <div className="text-sm opacity-90">View detailed reports</div>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/support" 
          className="group p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all"
        >
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 mr-3" />
            <div>
              <div className="font-semibold">Support</div>
              <div className="text-sm opacity-90">Manage tickets</div>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/settings" 
          className="group p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <div className="flex items-center">
            <Settings className="h-8 w-8 mr-3" />
            <div>
              <div className="font-semibold">Settings</div>
              <div className="text-sm opacity-90">Platform configuration</div>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/activity" 
          className="group p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <div className="flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            <div>
              <div className="font-semibold">Activity</div>
              <div className="text-sm opacity-90">System logs</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};