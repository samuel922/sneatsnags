import { api } from './api';
import type { CreateOfferRequest, UpdateOfferRequest, Offer, OfferSearchQuery } from '../types/offer';

export interface BuyerStats {
  totalOffers: number;
  activeOffers: number;
  acceptedOffers: number;
  totalSpent: number;
  averageOfferPrice: number;
}

export interface BuyerDashboard {
  recentOffers: Offer[];
  upcomingEvents: any[];
  stats: {
    activeOffers: number;
    acceptedOffers: number;
    totalOffers: number;
  };
}

export interface TicketListing {
  id: string;
  eventId: string;
  sectionId: string;
  sellerId: string;
  price: number;
  quantity: number;
  row?: string;
  seats: string[];
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    name: string;
    eventDate: string;
    venue: string;
    city: string;
    state: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TransactionDetails {
  id: string;
  buyerId: string;
  sellerId: string;
  offerId: string;
  listingId: string;
  eventId: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
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
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

class BuyerService {
  async getDashboard(): Promise<BuyerDashboard> {
    const response = await api.get('/buyers/dashboard');
    return response.data?.data || response.data || response;
  }

  async getStats(): Promise<BuyerStats> {
    const response = await api.get('/buyers/stats');
    return response.data?.data || response.data || response;
  }

  async createOffer(offerData: CreateOfferRequest): Promise<Offer> {
    const response = await api.post('/buyers/offers', offerData);
    return response.data?.data || response.data || response;
  }

  async getMyOffers(query?: OfferSearchQuery): Promise<{
    data: Offer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/buyers/offers', query);
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || response.pagination || {},
    };
  }

  async getOffer(offerId: string): Promise<Offer> {
    const response = await api.get(`/buyers/offers/${offerId}`);
    return response.data?.data || response.data || response;
  }

  async updateOffer(offerId: string, updates: UpdateOfferRequest): Promise<Offer> {
    const response = await api.put(`/buyers/offers/${offerId}`, updates);
    return response.data?.data || response.data || response;
  }

  async cancelOffer(offerId: string): Promise<void> {
    await api.delete(`/buyers/offers/${offerId}`);
  }

  async searchTickets(query: {
    eventId?: string;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    sectionId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: TicketListing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/buyers/tickets/search', query);
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || response.pagination || {},
    };
  }

  async getTransactions(query?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: TransactionDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/buyers/transactions', query);
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || response.pagination || {},
    };
  }

  async searchEvents(query?: {
    search?: string;
    city?: string;
    state?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/buyers/events', query);
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || response.pagination || {},
    };
  }

  async getEvent(eventId: string): Promise<any> {
    const response = await api.get(`/buyers/events/${eventId}`);
    return response.data?.data || response.data || response;
  }

  async getEventOffers(eventId: string, query?: {
    page?: number;
    limit?: number;
  }): Promise<{
    data: Offer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get(`/buyers/events/${eventId}/offers`, query);
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || response.pagination || {},
    };
  }
}

export const buyerService = new BuyerService();