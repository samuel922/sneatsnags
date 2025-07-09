import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <Link to="/events">
          <Button>Browse Events</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Active Offers</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Accepted Offers</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Offers</h3>
            <p className="text-3xl font-bold text-gray-600 mt-2">0</p>
          </div>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Browse Events</h3>
                <p className="text-sm text-gray-600">Find the events you're interested in</p>
              </div>
              <Link to="/events" className="ml-auto">
                <Button size="sm">Browse Events</Button>
              </Link>
            </div>

            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Search Tickets</h3>
                <p className="text-sm text-gray-600">Find tickets that match your criteria</p>
              </div>
              <Link to="/tickets/search" className="ml-auto">
                <Button size="sm">Search Tickets</Button>
              </Link>
            </div>

            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Make Offers</h3>
                <p className="text-sm text-gray-600">Submit offers on tickets you want to buy</p>
              </div>
              <Link to="/listings" className="ml-auto">
                <Button size="sm">Browse Listings</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/tickets/search">
              <Button className="w-full">Search Tickets</Button>
            </Link>
            <Link to="/my-offers">
              <Button variant="outline" className="w-full">View My Offers</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};