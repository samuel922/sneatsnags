import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const SellerDashboard = () => {
  const { user } = useAuth();
  
  // Mock stats for demonstration
  const stats = {
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
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
              {stats.totalListings}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.activeListings}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Sold Listings</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats.soldListings}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              ${Number(stats.totalRevenue).toFixed(2)}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Create Your First Listing</h4>
                  <p className="text-sm text-gray-600">Start selling tickets by creating your first listing</p>
                </div>
                <Link to="/seller/listings/new" className="ml-auto">
                  <Button size="sm">Create Listing</Button>
                </Link>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Manage Your Listings</h4>
                  <p className="text-sm text-gray-600">View and edit your active listings</p>
                </div>
                <Link to="/seller/listings" className="ml-auto">
                  <Button size="sm">Manage Listings</Button>
                </Link>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Review Offers</h4>
                  <p className="text-sm text-gray-600">Accept or negotiate offers from buyers</p>
                </div>
                <Link to="/seller/offers" className="ml-auto">
                  <Button size="sm">Browse Offers</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {stats.totalListings && stats.soldListings 
                    ? Math.round((stats.soldListings / stats.totalListings) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Sale Price</span>
                <span className="font-semibold">
                  ${stats.soldListings && stats.totalRevenue 
                    ? (Number(stats.totalRevenue) / stats.soldListings).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active vs Total</span>
                <span className="font-semibold">
                  {stats.totalListings && stats.activeListings
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

      {/* Demo Notice */}
      <div className="text-center text-gray-600 mt-8">
        <p className="text-sm">This is a demo version with sample data</p>
      </div>
    </div>
  );
};