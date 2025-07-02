import { apiClient } from './api';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface SetupIntent {
  id: string;
  client_secret: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  created: number;
}

export interface SellerAccount {
  id: string;
  url?: string;
  requirements?: {
    disabled_reason?: string;
    eventually_due: string[];
    currently_due: string[];
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

export const paymentService = {
  // Payment Intent Operations
  async createPaymentIntent(transactionId: string): Promise<PaymentIntent> {
    const response = await apiClient.post<PaymentIntent>(
      `/transactions/${transactionId}/payment-intent`
    );
    return response.data!;
  },

  async processPayment(transactionId: string, paymentMethodId: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/process-payment`,
      { paymentMethodId }
    );
    return response.data!;
  },

  async confirmPayment(transactionId: string, paymentIntentId: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/confirm-payment`,
      { paymentIntentId }
    );
    return response.data!;
  },

  // Payment Method Management
  async setupPaymentMethod(): Promise<SetupIntent> {
    const response = await apiClient.post<SetupIntent>('/transactions/setup-payment-method');
    return response.data!;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<{ data: PaymentMethod[] }>('/transactions/payment-methods');
    return response.data!.data;
  },

  // Seller Account Management
  async createSellerAccount(): Promise<SellerAccount> {
    const response = await apiClient.post<SellerAccount>('/transactions/seller-account');
    return response.data!;
  },

  async createSellerOnboardingLink(refreshUrl: string, returnUrl: string): Promise<{ url: string }> {
    const response = await apiClient.post<{ url: string }>('/transactions/seller-onboarding', {
      refreshUrl,
      returnUrl
    });
    return response.data!;
  },

  // Refund Operations
  async requestRefund(transactionId: string, reason: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/refund`,
      { reason }
    );
    return response.data!;
  },

  // Dispute Operations
  async disputeTransaction(transactionId: string, reason: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/dispute`,
      { reason }
    );
    return response.data!;
  },

  // Transaction Status Operations
  async markTicketsDelivered(transactionId: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/mark-delivered`
    );
    return response.data!;
  },

  async confirmTicketReceipt(transactionId: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/confirm-receipt`
    );
    return response.data!;
  },

  async cancelTransaction(transactionId: string, reason: string): Promise<any> {
    const response = await apiClient.post(
      `/transactions/${transactionId}/cancel`,
      { reason }
    );
    return response.data!;
  },
};