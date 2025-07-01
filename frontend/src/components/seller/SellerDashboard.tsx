import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { sellerService, type SellerStats } from '../../services/sellerService';
import { Link } from 'react-router-dom';

export const SellerDashboard = () => {
  const { data: stats, isLoading, error } = useQuery<SellerStats>({
    queryKey: ['seller-dashboard'],
    queryFn: () => sellerService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading dashboard. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link to="/seller/listings/new">
          <Button>Create New Listing</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Listings</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.totalListings || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.activeListings || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Sold Listings</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats?.soldListings || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              ${Number(stats?.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/seller/listings/new" className="block">
                <Button className="w-full">Create New Listing</Button>
              </Link>
              <Link to="/seller/listings" className="block">
                <Button variant="outline" className="w-full">
                  Manage Listings
                </Button>
              </Link>
              <Link to="/seller/offers" className="block">
                <Button variant="outline" className="w-full">
                  Browse Offers
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New listing created</span>
                <span className="text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Offer accepted</span>
                <span className="text-gray-500">1 day ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment received</span>
                <span className="text-gray-500">3 days ago</span>
              </div>
            </div>
            <Link to="/seller/transactions" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {stats?.totalListings && stats?.soldListings 
                    ? Math.round((stats.soldListings / stats.totalListings) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Sale Price</span>
                <span className="font-semibold">
                  ${stats?.soldListings && stats?.totalRevenue 
                    ? (Number(stats.totalRevenue) / stats.soldListings).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active vs Total</span>
                <span className="font-semibold">
                  {stats?.totalListings && stats?.activeListings
                    ? Math.round((stats.activeListings / stats.totalListings) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tips and Resources */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Tips for Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Optimize Your Listings</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload clear photos of your tickets</li>
                <li>• Set competitive prices</li>
                <li>• Include detailed seat information</li>
                <li>• Respond quickly to buyer inquiries</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Increase Sales</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Browse and respond to buyer offers</li>
                <li>• Keep your listings up to date</li>
                <li>• Deliver tickets promptly after sale</li>
                <li>• Maintain good seller ratings</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};