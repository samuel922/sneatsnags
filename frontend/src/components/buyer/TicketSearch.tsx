import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { buyerService, type TicketListing } from '../../services/buyerService';
import { Link } from 'react-router-dom';

export const TicketSearch = () => {
  const [searchParams, setSearchParams] = useState({
    eventId: '',
    city: '',
    state: '',
    minPrice: '',
    maxPrice: '',
    sectionId: '',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['ticket-search', searchParams],
    queryFn: () => buyerService.searchTickets({
      ...searchParams,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    }),
  });

  const handleParamChange = (key: string, value: string | number) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when searching
    }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage,
    }));
  };

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
        <p>Error loading tickets. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Search Tickets</h1>
      </div>

      {/* Search Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event ID
              </label>
              <Input
                type="text"
                placeholder="Enter event ID"
                value={searchParams.eventId}
                onChange={(e) => handleParamChange('eventId', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Input
                type="text"
                placeholder="Enter city"
                value={searchParams.city}
                onChange={(e) => handleParamChange('city', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Input
                type="text"
                placeholder="Enter state"
                value={searchParams.state}
                onChange={(e) => handleParamChange('state', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section ID
              </label>
              <Input
                type="text"
                placeholder="Enter section ID"
                value={searchParams.sectionId}
                onChange={(e) => handleParamChange('sectionId', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="Min price"
                value={searchParams.minPrice}
                onChange={(e) => handleParamChange('minPrice', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="Max price"
                value={searchParams.maxPrice}
                onChange={(e) => handleParamChange('maxPrice', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Results per page
              </label>
              <select
                value={searchParams.limit}
                onChange={(e) => handleParamChange('limit', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {data.pagination.total} tickets found
            </p>
          </div>

          {data.data.map((ticket: TicketListing) => (
            <Card key={ticket.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.event.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Price:</strong> ${ticket.price}</p>
                        <p><strong>Quantity:</strong> {ticket.quantity}</p>
                        <p><strong>Seats:</strong> {ticket.seats.join(', ')}</p>
                        {ticket.row && <p><strong>Row:</strong> {ticket.row}</p>}
                      </div>
                      <div>
                        <p><strong>Event Date:</strong> {new Date(ticket.event.eventDate).toLocaleDateString()}</p>
                        <p><strong>Venue:</strong> {ticket.event.venue}</p>
                        <p><strong>Location:</strong> {ticket.event.city}, {ticket.event.state}</p>
                        <p><strong>Seller:</strong> {ticket.seller.firstName} {ticket.seller.lastName}</p>
                      </div>
                    </div>

                    {ticket.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {ticket.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Listed on {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {ticket.status === 'AVAILABLE' && (
                      <>
                        <Link to={`/events/${ticket.eventId}/offer`}>
                          <Button size="sm">
                            Make Offer
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement contact seller functionality
                            console.log('Contact seller for ticket:', ticket.id);
                          }}
                        >
                          Contact Seller
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={searchParams.page <= 1}
                onClick={() => handlePageChange(searchParams.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={searchParams.page >= data.pagination.totalPages}
                onClick={() => handlePageChange(searchParams.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-4">No tickets found</p>
            <p>Try adjusting your search criteria or browse all events.</p>
            <Link to="/events" className="mt-4 inline-block">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};