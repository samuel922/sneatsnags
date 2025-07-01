import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { buyerService } from '../../services/buyerService';
import type { Offer, OfferStatus } from '../../types/offer';

interface BuyerOffersListProps {
  showUserOffersOnly?: boolean;
}

export const BuyerOffersList = ({}: BuyerOffersListProps) => {
  const [filters, setFilters] = useState({
    status: undefined as OfferStatus | undefined,
    eventId: '',
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['buyer-offers', filters],
    queryFn: () => buyerService.getMyOffers(filters),
  });

  const cancelOfferMutation = useMutation({
    mutationFn: (offerId: string) => buyerService.cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-offers'] });
    },
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleCancelOffer = async (offerId: string) => {
    if (window.confirm('Are you sure you want to cancel this offer?')) {
      try {
        await cancelOfferMutation.mutateAsync(offerId);
      } catch (error) {
        console.error('Failed to cancel offer:', error);
      }
    }
  };

  const getStatusColor = (status: OfferStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <p>Error loading offers. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filter Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as OfferStatus || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event ID
              </label>
              <Input
                type="text"
                placeholder="Filter by event ID"
                value={filters.eventId}
                onChange={(e) => handleFilterChange('eventId', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
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

      {/* Offers List */}
      {data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((offer: Offer) => (
            <Card key={offer.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.event?.name || 'Event Name'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(offer.status)}`}>
                        {offer.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Max Price:</strong> ${offer.maxPrice}</p>
                        <p><strong>Quantity:</strong> {offer.quantity}</p>
                        <p><strong>Created:</strong> {new Date(offer.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p><strong>Expires:</strong> {new Date(offer.expiresAt).toLocaleDateString()}</p>
                        {offer.event && (
                          <>
                            <p><strong>Venue:</strong> {offer.event.venue}</p>
                            <p><strong>Location:</strong> {offer.event.city}, {offer.event.state}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {offer.message && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Message:</strong> {offer.message}
                        </p>
                      </div>
                    )}

                    {offer.sections && offer.sections.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Sections:</strong> {offer.sections.map(s => s.section?.name).join(', ')}
                        </p>
                      </div>
                    )}

                    {offer.transaction && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Transaction:</strong> ${offer.transaction.totalAmount} - {offer.transaction.status}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {offer.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit offer functionality
                            console.log('Edit offer:', offer.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleCancelOffer(offer.id)}
                          disabled={cancelOfferMutation.isPending}
                        >
                          {cancelOfferMutation.isPending ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={filters.page >= data.pagination.totalPages}
                onClick={() => handleFilterChange('page', filters.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-4">No offers found</p>
            <p>Start making offers on events you're interested in!</p>
          </div>
        </Card>
      )}
    </div>
  );
};