import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box } from '@mui/material';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  Package,
  Truck,
  Receipt
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { transactionService } from '../../services/transactionService';
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

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
  userType: 'buyer' | 'seller';
  onTransactionUpdate?: () => void;
  onDeliverTickets?: (transaction: any) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  open,
  onClose,
  transaction,
  userType,
  onTransactionUpdate,
  onDeliverTickets
}) => {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const handleConfirmReceipt = async () => {
    const result = await SweetAlert.confirm(
      'Confirm Receipt',
      'Are you sure you want to confirm that you have received the tickets? This will release payment to the seller.',
      'Yes, Confirm Receipt',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        SweetAlert.loading('Confirming Receipt', 'Processing your confirmation...');
        
        await paymentService.confirmTicketReceipt(transaction.id);
        
        SweetAlert.close();
        SweetAlert.success('Receipt Confirmed!', 'Payment has been released to the seller.');
        
        if (onTransactionUpdate) {
          onTransactionUpdate();
        }
        onClose();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Confirmation Failed', 'Failed to confirm receipt. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkDelivered = async () => {
    const result = await SweetAlert.confirm(
      'Mark as Delivered',
      'Are you sure you want to mark the tickets as delivered? This will notify the buyer.',
      'Yes, Mark as Delivered',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        SweetAlert.loading('Marking as Delivered', 'Updating delivery status...');
        
        await paymentService.markTicketsDelivered(transaction.id);
        
        SweetAlert.close();
        SweetAlert.success('Tickets Marked as Delivered!', 'The buyer has been notified.');
        
        if (onTransactionUpdate) {
          onTransactionUpdate();
        }
        onClose();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Update Failed', 'Failed to update delivery status. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelTransaction = async () => {
    const result = await SweetAlert.confirm(
      'Cancel Transaction',
      'Are you sure you want to cancel this transaction? This action cannot be undone.',
      'Yes, Cancel Transaction',
      'Keep Transaction'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        SweetAlert.loading('Canceling Transaction', 'Processing cancellation...');
        
        await paymentService.cancelTransaction(transaction.id, 'Cancelled by user');
        
        SweetAlert.close();
        SweetAlert.success('Transaction Cancelled!', 'The transaction has been cancelled successfully.');
        
        if (onTransactionUpdate) {
          onTransactionUpdate();
        }
        onClose();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Cancellation Failed', 'Failed to cancel transaction. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRequestRefund = async () => {
    const result = await SweetAlert.confirm(
      'Request Refund',
      'Are you sure you want to request a refund for this transaction? Please provide a reason.',
      'Request Refund',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        SweetAlert.loading('Requesting Refund', 'Processing refund request...');
        
        await paymentService.requestRefund(transaction.id, 'Refund requested by buyer');
        
        SweetAlert.close();
        SweetAlert.success('Refund Requested!', 'Your refund request has been submitted for review.');
        
        if (onTransactionUpdate) {
          onTransactionUpdate();
        }
        onClose();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Refund Request Failed', 'Failed to request refund. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>Transaction Details</span>
          <IconButton onClick={onClose} size="small">
            <X className="h-4 w-4" />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Transaction Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Transaction Status</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="ml-2">{transaction.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Transaction ID</p>
                  <p className="font-medium">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                </div>
                {transaction.paidAt && (
                  <div>
                    <p className="text-gray-600">Paid At</p>
                    <p className="font-medium">{formatDate(transaction.paidAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Event Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{transaction.offer.event.name}</p>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(transaction.offer.event.eventDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{transaction.offer.event.venue}, {transaction.offer.event.city}, {transaction.offer.event.state}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{transaction.offer.quantity} ticket{transaction.offer.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  <span>Seats: {transaction.listing.seats.join(', ')}</span>
                  {transaction.listing.row && <span> | Row: {transaction.listing.row}</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(transaction.amount - transaction.platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">{formatPrice(transaction.platformFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">{formatPrice(transaction.amount)}</span>
                </div>
                {userType === 'seller' && transaction.sellerAmount && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Your Earnings</span>
                    <span className="font-bold">{formatPrice(transaction.sellerAmount)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parties Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Transaction Parties
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buyer Info */}
                <div>
                  <h4 className="font-medium mb-3">Buyer Information</h4>
                  <div className="space-y-2 text-sm">
                    {transaction.buyer ? (
                      <>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatName(transaction.buyer.firstName, transaction.buyer.lastName)}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{transaction.buyer.email}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">Buyer information not available</span>
                    )}
                  </div>
                </div>

                {/* Seller Info */}
                <div>
                  <h4 className="font-medium mb-3">Seller Information</h4>
                  <div className="space-y-2 text-sm">
                    {transaction.listing?.seller ? (
                      <>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatName(transaction.listing.seller.firstName, transaction.listing.seller.lastName)}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{transaction.listing.seller.email}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">Seller information not available</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Delivery Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      transaction.ticketsDelivered ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">Tickets Delivered</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {transaction.ticketsDelivered ? (
                      transaction.ticketsDeliveredAt ? 
                        formatDate(transaction.ticketsDeliveredAt) : 
                        'Delivered'
                    ) : (
                      'Pending'
                    )}
                  </div>
                </div>

                {userType === 'seller' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        transaction.sellerPaidOut ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Payment Received</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.sellerPaidOut ? (
                        transaction.sellerPaidOutAt ? 
                          formatDate(transaction.sellerPaidOutAt) : 
                          'Paid'
                      ) : (
                        'Pending'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {transaction.offer.message && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Buyer Message
                </h3>
                <p className="text-gray-700 italic">"{transaction.offer.message}"</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {userType === 'buyer' && (
              <>
                {transaction.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    onClick={handleCancelTransaction}
                    disabled={loading}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Cancel Transaction
                  </Button>
                )}
                
                {transaction.ticketsDelivered && !transaction.buyerConfirmed && transaction.status !== 'COMPLETED' && (
                  <Button
                    onClick={handleConfirmReceipt}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Confirm Receipt & Release Payment
                  </Button>
                )}
                
                {transaction.status === 'COMPLETED' && (
                  <Button
                    variant="outline"
                    onClick={handleRequestRefund}
                    disabled={loading}
                  >
                    Request Refund
                  </Button>
                )}
              </>
            )}

            {userType === 'seller' && (
              <>
                {!transaction.sellerPaidOut && transaction.status === 'COMPLETED' && (
                  <>
                    <Button
                      onClick={() => onDeliverTickets?.(transaction)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Deliver Tickets
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMarkDelivered}
                      disabled={loading}
                    >
                      Mark as Delivered
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};