import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { buyerService, type BuyerDashboard as BuyerDashboardType } from '../../services/buyerService';
import { Link } from 'react-router-dom';

export const BuyerDashboard = () => {
  const { data: dashboard, isLoading, error } = useQuery<BuyerDashboardType>({
    queryKey: ['buyer-dashboard'],
    queryFn: () => buyerService.getDashboard(),
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
        <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
        <Link to="/events">
          <Button>Browse Events</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Active Offers</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {dashboard?.stats.activeOffers || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Accepted Offers</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {dashboard?.stats.acceptedOffers || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Offers</h3>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {dashboard?.stats.totalOffers || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Offers */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Offers</h2>
            <Link to="/my-offers">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {dashboard?.recentOffers && dashboard.recentOffers.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {offer.event?.name || 'Event Name'}
                      </h3>
                      <p className="text-gray-600">
                        Max Price: ${offer.maxPrice} • Quantity: {offer.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        offer.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : offer.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : offer.status === 'EXPIRED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No offers yet. Start by browsing events and making your first offer!</p>
              <Link to="/events" className="mt-4 inline-block">
                <Button>Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/events">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {dashboard?.upcomingEvents && dashboard.upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {dashboard.upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-gray-600">
                        {event.venue} • {event.city}, {event.state}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/events/${event.id}/offer`}>
                      <Button variant="outline" size="sm">
                        Make Offer
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No upcoming events found.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};