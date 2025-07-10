import { apiClient } from './api';
import type { Listing, CreateListingRequest, UpdateListingRequest, ListingFilters } from '../types/listing';
import type { PaginatedResponse, QueryParams } from '../types/api';

export const listingService = {
  // Public listing viewing
  async getListings(params?: QueryParams & ListingFilters): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>('/listings', params);
    return response.data!;
  },

  async getListingsSilent(params?: QueryParams & ListingFilters): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.getSilent<any>('/listings', params);
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async getListing(id: string): Promise<Listing> {
    const response = await apiClient.get<Listing>(`/listings/${id}`);
    return response.data!;
  },

  async searchListings(query: string, params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>('/listings/search', {
      query,
      ...params,
    });
    return response.data!;
  },

  async getRecentListings(params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>('/listings/recent', params);
    return response.data!;
  },

  async getListingsByEvent(eventId: string, params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>(`/listings/events/${eventId}`, params);
    return response.data!;
  },

  async getListingsBySection(sectionId: string, params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>(`/listings/sections/${sectionId}`, params);
    return response.data!;
  },

  async getSimilarListings(id: string, params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>(`/listings/${id}/similar`, params);
    return response.data!;
  },

  async getListingStats(): Promise<any> {
    const response = await apiClient.get('/listings/stats');
    return response.data!;
  },

  // Seller methods
  async createListing(listingData: CreateListingRequest): Promise<Listing> {
    const response = await apiClient.post<Listing>('/listings', listingData);
    return response.data!;
  },

  async getMyListings(params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<PaginatedResponse<Listing>>('/listings/my-listings', params);
    return response.data!;
  },

  async updateListing(id: string, listingData: UpdateListingRequest): Promise<Listing> {
    const response = await apiClient.put<Listing>(`/listings/${id}`, listingData);
    return response.data!;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },

  async uploadTicketFiles(id: string, files: FileList): Promise<Listing> {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('ticketFiles', file);
    });

    const response = await apiClient.upload<Listing>(`/listings/${id}/upload-tickets`, formData);
    return response.data!;
  },

  async markAsSold(id: string): Promise<void> {
    await apiClient.post(`/listings/${id}/mark-sold`);
  },

  // Seller-specific routes
  async getSellerListings(params?: QueryParams): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<any>('/sellers/listings', params);
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async createSellerListing(listingData: CreateListingRequest): Promise<Listing> {
    const response = await apiClient.post<Listing>('/sellers/listings', listingData);
    return response.data!;
  },

  async updateSellerListing(id: string, listingData: UpdateListingRequest): Promise<Listing> {
    const response = await apiClient.put<Listing>(`/sellers/listings/${id}`, listingData);
    return response.data!;
  },

  async deleteSellerListing(id: string): Promise<void> {
    await apiClient.delete(`/sellers/listings/${id}`);
  },

  async uploadSellerTicketFiles(id: string, files: FileList): Promise<Listing> {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('ticketFiles', file);
    });

    const response = await apiClient.upload<Listing>(`/sellers/listings/${id}/upload-tickets`, formData);
    return response.data!;
  },
};