import { apiClient } from './api';
import type { Transaction, CreateTransactionRequest, ProcessPaymentRequest, TransactionFilters } from '../types/transaction';
import type { PaginatedResponse, QueryParams } from '../types/api';

export const transactionService = {
  // User transaction methods
  async getMyTransactions(params?: QueryParams & TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions/my-transactions', params);
    return response.data!;
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data!;
  },

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions', transactionData);
    return response.data!;
  },

  async processPayment(id: string, paymentData: ProcessPaymentRequest): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/process-payment`, paymentData);
    return response.data!;
  },

  async confirmPayment(id: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/confirm-payment`);
    return response.data!;
  },

  async deliverTickets(id: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/deliver-tickets`);
    return response.data!;
  },

  async confirmReceipt(id: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/confirm-receipt`);
    return response.data!;
  },

  async requestRefund(id: string, reason: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/request-refund`, { reason });
    return response.data!;
  },

  async disputeTransaction(id: string, reason: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/dispute`, { reason });
    return response.data!;
  },

  async cancelTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/cancel`);
    return response.data!;
  },

  async getTransactionsByEvent(eventId: string, params?: QueryParams): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(`/transactions/events/${eventId}`, params);
    return response.data!;
  },

  // Stripe payment methods
  async createPaymentIntent(id: string): Promise<{ clientSecret: string }> {
    const response = await apiClient.post<{ clientSecret: string }>(`/transactions/${id}/create-payment-intent`);
    return response.data!;
  },

  async createSellerAccount(): Promise<{ accountId: string }> {
    const response = await apiClient.post<{ accountId: string }>('/transactions/seller/create-account');
    return response.data!;
  },

  async createOnboardingLink(): Promise<{ url: string }> {
    const response = await apiClient.post<{ url: string }>('/transactions/seller/onboarding-link');
    return response.data!;
  },

  async setupPaymentMethod(): Promise<{ setupIntent: string }> {
    const response = await apiClient.post<{ setupIntent: string }>('/transactions/payment-methods/setup');
    return response.data!;
  },

  async getPaymentMethods(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/transactions/payment-methods');
    return response.data!;
  },

  // Seller methods
  async getSellerTransactions(params?: QueryParams): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/sellers/transactions', params);
    return response.data!;
  },

  async markTicketsDelivered(id: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/sellers/transactions/${id}/deliver`);
    return response.data!;
  },

  // Admin methods (when user has admin role)
  async getAllTransactions(params?: QueryParams & TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', params);
    return response.data!;
  },

  async getTransactionStats(): Promise<any> {
    const response = await apiClient.get('/transactions/stats');
    return response.data!;
  },

  async processRefund(id: string, amount?: number): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/process-refund`, { amount });
    return response.data!;
  },

  async resolveDispute(id: string, resolution: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/resolve-dispute`, { resolution });
    return response.data!;
  },

  async processSellerPayout(id: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/seller-payout`);
    return response.data!;
  },
};