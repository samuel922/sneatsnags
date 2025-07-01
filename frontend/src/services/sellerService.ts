import { api } from './api';

export interface CreateListingRequest {
  eventId: string;
  sectionId: string;
  row?: string;
  seats: string[];
  price: number;
  quantity: number;
  notes?: string;
  ticketFiles?: string[];
}

export interface UpdateListingRequest {
  price?: number;
  notes?: string;
  status?: string;
}

export interface SellerListing {
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
  ticketFiles: string[];
  isVerified: boolean;
  verifiedAt?: string;
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
  section: {
    id: string;
    name: string;
  };
}

export interface SellerStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenue: number;
}

export interface SellerTransaction {
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
  sellerPaidOut: boolean;
  sellerPaidOutAt?: string;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  };
}

export interface AvailableOffer {
  id: string;
  eventId: string;
  buyerId: string;
  maxPrice: number;
  quantity: number;
  message?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  event: {
    id: string;
    name: string;
    eventDate: string;
    venue: string;
    city: string;
    state: string;
  };
  sections: Array<{
    id: string;
    offerId: string;
    sectionId: string;
    section: {
      id: string;
      name: string;
    };
  }>;
}

class SellerService {
  async getDashboard(): Promise<SellerStats> {
    const response = await api.get('/sellers/dashboard');
    return response.data.data;
  }

  async getListings(query?: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
  }): Promise<{
    data: SellerListing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/sellers/listings', { params: query });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async createListing(listingData: CreateListingRequest): Promise<SellerListing> {
    const response = await api.post('/sellers/listings', listingData);
    return response.data.data;
  }

  async updateListing(listingId: string, updates: UpdateListingRequest): Promise<SellerListing> {
    const response = await api.put(`/sellers/listings/${listingId}`, updates);
    return response.data.data;
  }

  async deleteListing(listingId: string): Promise<void> {
    await api.delete(`/sellers/listings/${listingId}`);
  }

  async getTransactions(query?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    data: SellerTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/sellers/transactions', { params: query });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async acceptOffer(offerId: string, listingId: string): Promise<SellerTransaction> {
    const response = await api.post(`/sellers/offers/${offerId}/accept`, { listingId });
    return response.data.data;
  }

  async markTicketsDelivered(transactionId: string): Promise<SellerTransaction> {
    const response = await api.post(`/sellers/transactions/${transactionId}/deliver`);
    return response.data.data;
  }

  async uploadTicketFiles(listingId: string, files: File[]): Promise<SellerListing> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('tickets', file);
    });

    const response = await api.post(`/sellers/listings/${listingId}/upload-tickets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async getAvailableOffers(query?: {
    page?: number;
    limit?: number;
    eventId?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{
    data: AvailableOffer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/sellers/offers', { params: query });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }
}

export const sellerService = new SellerService();