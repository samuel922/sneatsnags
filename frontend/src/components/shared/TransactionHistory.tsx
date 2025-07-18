import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { buyerService } from '../../services/buyerService';
import { sellerService } from '../../services/sellerService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { TransactionDetailModal } from '../transaction/TransactionDetailModal';
import { TicketDeliveryModal } from '../transaction/TicketDeliveryModal';
import SweetAlert from '../../utils/sweetAlert';

// Helper function to format names safely
const formatName = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) return 'Name not available';
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
};

interface TransactionHistoryProps {
  userType: 'buyer' | 'seller';
}

// Generic transaction interface to handle both buyer and seller transactions
interface BaseTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  offerId: string;
  listingId: string;
  eventId: string;
  amount: number;
  platformFee: number;
  status: string;
  paidAt?: string;
  ticketsDelivered: boolean;
  ticketsDeliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  offer: {
    id: string;
    maxPrice: number;
    quantity: number;
    message?: string;
    event: {
      id: string;
      name: string;
      eventDate: string;
      venue: string;
      city: string;
      state: string;
    };
  };
  listing: {
    id: string;
    price: number;
    seats: string[];
    row?: string;
    seller?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sellerAmount?: number;
  sellerPaidOut: boolean;
  sellerPaidOutAt?: string;
  buyerConfirmed?: boolean;
}

interface PaginatedTransactionResponse {
  data: BaseTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const TransactionHistory = ({ userType }: TransactionHistoryProps) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<BaseTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryTransaction, setDeliveryTransaction] = useState<BaseTransaction | null>(null);

  const { data, isLoading, error, refetch } = useQuery<PaginatedTransactionResponse>({
    queryKey: [`${userType}-transactions`, filters],
    queryFn: async (): Promise<PaginatedTransactionResponse> => {
      if (userType === 'buyer') {
        const response = await buyerService.getTransactions(filters);
        return response as PaginatedTransactionResponse;
      } else {
        const response = await sellerService.getTransactions(filters);
        return response as PaginatedTransactionResponse;
      }
    },
    enabled: !!user && (
      (userType === 'buyer' && user.role === UserRole.BUYER) ||
      (userType === 'seller' && user.role === UserRole.SELLER)
    ),
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleViewDetails = (transaction: BaseTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  const handleDeliverTickets = (transaction: BaseTransaction) => {
    setDeliveryTransaction(transaction);
    setShowDeliveryModal(true);
  };

  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setDeliveryTransaction(null);
  };

  const handleDeliveryComplete = () => {
    refetch();
    setShowDeliveryModal(false);
    setDeliveryTransaction(null);
  };

  const handleTransactionUpdate = () => {
    refetch();
  };

  const handleQuickCancel = async (transaction: BaseTransaction) => {
    const result = await SweetAlert.confirm(
      'Cancel Transaction',
      'Are you sure you want to cancel this transaction?',
      'Yes, Cancel',
      'Keep Transaction'
    );

    if (result.isConfirmed) {
      try {
        SweetAlert.loading('Canceling Transaction', 'Please wait...');
        await paymentService.cancelTransaction(transaction.id, 'Cancelled by user');
        SweetAlert.close();
        SweetAlert.success('Transaction Cancelled!', 'The transaction has been cancelled successfully.');
        refetch();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Cancellation Failed', 'Failed to cancel transaction. Please try again.');
      }
    }
  };

  const handleQuickConfirmReceipt = async (transaction: BaseTransaction) => {
    const result = await SweetAlert.confirm(
      'Confirm Receipt & Release Payment',
      'Are you sure you want to confirm that you received the tickets? This will release payment to the seller.',
      'Yes, Confirm Receipt',
      'Not Yet'
    );

    if (result.isConfirmed) {
      try {
        SweetAlert.loading('Confirming Receipt', 'Processing your confirmation...');
        await paymentService.confirmTicketReceipt(transaction.id);
        SweetAlert.close();
        SweetAlert.success('Receipt Confirmed!', 'Payment has been released to the seller.');
        refetch();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Confirmation Failed', 'Failed to confirm receipt. Please try again.');
      }
    }
  };

  const handleMarkDelivered = async (transaction: BaseTransaction) => {
    const result = await SweetAlert.confirm(
      'Mark as Delivered',
      'Are you sure the tickets have been delivered to the buyer?',
      'Yes, Mark as Delivered',
      'Not Yet'
    );

    if (result.isConfirmed) {
      try {
        SweetAlert.loading('Marking as Delivered', 'Updating delivery status...');
        await paymentService.markTicketsDelivered(transaction.id);
        SweetAlert.close();
        SweetAlert.success('Marked as Delivered!', 'The buyer has been notified.');
        refetch();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Update Failed', 'Failed to update delivery status. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
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
        <p>Error loading transactions. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filter Transactions</h3>
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
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
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

      {/* Transactions List */}
      {data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((transaction: BaseTransaction) => (
            <Card key={transaction.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.offer?.event?.name || 'Event Name Not Available'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Amount:</strong> ${Number(transaction.amount).toFixed(2)}</p>
                        <p><strong>Platform Fee:</strong> ${Number(transaction.platformFee).toFixed(2)}</p>
                        {userType === 'seller' && transaction.sellerAmount && (
                          <p><strong>Your Amount:</strong> ${Number(transaction.sellerAmount).toFixed(2)}</p>
                        )}
                        <p><strong>Quantity:</strong> {transaction.offer?.quantity || 'N/A'}</p>
                        <p><strong>Seats:</strong> {transaction.listing?.seats?.join(', ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Event Date:</strong> {transaction.offer?.event?.eventDate ? new Date(transaction.offer.event.eventDate).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Venue:</strong> {transaction.offer?.event?.venue || 'N/A'}</p>
                        <p><strong>Location:</strong> {transaction.offer?.event?.city || 'N/A'}, {transaction.offer?.event?.state || 'N/A'}</p>
                        <p><strong>Transaction Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</p>
                        {transaction.paidAt && (
                          <p><strong>Paid At:</strong> {new Date(transaction.paidAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    {transaction.listing?.row && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Row:</strong> {transaction.listing.row}
                        </p>
                      </div>
                    )}

                    {userType === 'buyer' && transaction.listing?.seller && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Seller:</strong> {formatName(transaction.listing.seller.firstName, transaction.listing.seller.lastName)}
                        </p>
                      </div>
                    )}

                    {userType === 'seller' && transaction.buyer && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Buyer:</strong> {formatName(transaction.buyer.firstName, transaction.buyer.lastName)}
                        </p>
                      </div>
                    )}

                    {transaction.offer?.message && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>Buyer Message:</strong> {transaction.offer.message}
                        </p>
                      </div>
                    )}

                    {/* Delivery Status */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.ticketsDelivered ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm text-gray-700">
                          Tickets {transaction.ticketsDelivered ? 'Delivered' : 'Pending Delivery'}
                        </span>
                        {transaction.ticketsDeliveredAt && (
                          <span className="text-xs text-gray-500">
                            ({new Date(transaction.ticketsDeliveredAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>

                      {userType === 'seller' && (
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.sellerPaidOut ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-sm text-gray-700">
                            Payment {transaction.sellerPaidOut ? 'Received' : 'Pending'}
                          </span>
                          {transaction.sellerPaidOutAt && (
                            <span className="text-xs text-gray-500">
                              ({new Date(transaction.sellerPaidOutAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(transaction)}
                    >
                      View Details
                    </Button>

                    {userType === 'buyer' && 
                     transaction.ticketsDelivered && 
                     !transaction.buyerConfirmed && 
                     transaction.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickConfirmReceipt(transaction)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Release Payment
                      </Button>
                    )}

                    {userType === 'seller' && 
                     !transaction.sellerPaidOut && 
                     transaction.status === 'COMPLETED' && (
                      <Button
                        size="sm"
                        onClick={() => handleDeliverTickets(transaction)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Deliver Tickets
                      </Button>
                    )}

                    {transaction.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleQuickCancel(transaction)}
                      >
                        Cancel
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
            <p className="text-lg mb-4">No transactions found</p>
            <p>
              {userType === 'buyer' 
                ? 'Your accepted offers will appear here as transactions.'
                : 'Your sold tickets will appear here as transactions.'
              }
            </p>
          </div>
        </Card>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          open={showDetailModal}
          onClose={handleCloseDetailModal}
          transaction={selectedTransaction}
          userType={userType}
          onTransactionUpdate={handleTransactionUpdate}
          onDeliverTickets={handleDeliverTickets}
        />
      )}

      {/* Ticket Delivery Modal */}
      {deliveryTransaction && (
        <TicketDeliveryModal
          open={showDeliveryModal}
          onClose={handleCloseDeliveryModal}
          transaction={deliveryTransaction}
          onDeliveryComplete={handleDeliveryComplete}
        />
      )}
    </div>
  );
};