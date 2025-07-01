export interface Transaction {
  id: string;
  buyerId: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sellerId: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  eventId: string;
  event: {
    id: string;
    name: string;
    date: string;
    venue: string;
    city: string;
    state: string;
  };
  offerId?: string;
  listingId?: string;
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
  serviceFee: number;
  sellerFee: number;
  buyerTotal: number;
  sellerPayout: number;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  status: TransactionStatus;
  ticketsDelivered: boolean;
  deliveredAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const TransactionStatus = {
  PENDING: 'PENDING',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAID: 'PAID',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED'
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export interface CreateTransactionRequest {
  offerId?: string;
  listingId?: string;
  quantity: number;
  pricePerTicket: number;
}

export interface ProcessPaymentRequest {
  paymentMethodId: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}