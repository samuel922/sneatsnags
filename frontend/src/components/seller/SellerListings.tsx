import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { sellerService, type SellerListing } from '../../services/sellerService';
import { Link } from 'react-router-dom';

export const SellerListings = () => {
  const [filters, setFilters] = useState({
    status: '',
    eventId: '',
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-listings', filters],
    queryFn: () => sellerService.getListings(filters),
  });

  const deleteListingMutation = useMutation({
    mutationFn: (listingId: string) => sellerService.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
    },
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteListingMutation.mutateAsync(listingId);
      } catch (error) {
        console.error('Failed to delete listing:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
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
        <p>Error loading listings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
        <Link to="/seller/listings/new">
          <Button>Create New Listing</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filter Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="PENDING">Pending</option>
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

      {/* Listings */}
      {data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((listing: SellerListing) => (
            <Card key={listing.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {listing.event.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                      {listing.isVerified && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Price:</strong> ${listing.price}</p>
                        <p><strong>Quantity:</strong> {listing.quantity}</p>
                        <p><strong>Seats:</strong> {listing.seats.join(', ')}</p>
                        {listing.row && <p><strong>Row:</strong> {listing.row}</p>}
                        <p><strong>Section:</strong> {listing.section.name}</p>
                      </div>
                      <div>
                        <p><strong>Event Date:</strong> {new Date(listing.event.eventDate).toLocaleDateString()}</p>
                        <p><strong>Venue:</strong> {listing.event.venue}</p>
                        <p><strong>Location:</strong> {listing.event.city}, {listing.event.state}</p>
                        <p><strong>Listed:</strong> {new Date(listing.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {listing.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {listing.notes}
                        </p>
                      </div>
                    )}

                    {listing.ticketFiles && listing.ticketFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Ticket Files:</strong> {listing.ticketFiles.length} file(s) uploaded
                        </p>
                      </div>
                    )}

                    {listing.verifiedAt && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Verified on {new Date(listing.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {listing.status === 'AVAILABLE' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit listing functionality
                            console.log('Edit listing:', listing.id);
                          }}
                        >
                          Edit
                        </Button>
                        
                        {(!listing.ticketFiles || listing.ticketFiles.length === 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement upload ticket files functionality
                              console.log('Upload files for listing:', listing.id);
                            }}
                          >
                            Upload Files
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteListing(listing.id)}
                          disabled={deleteListingMutation.isPending}
                        >
                          {deleteListingMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    )}

                    {listing.status === 'SOLD' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: View transaction details
                          console.log('View transaction for listing:', listing.id);
                        }}
                      >
                        View Sale
                      </Button>
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
            <p className="text-lg mb-4">No listings found</p>
            <p>Create your first listing to start selling tickets!</p>
            <Link to="/seller/listings/new" className="mt-4 inline-block">
              <Button>Create New Listing</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};