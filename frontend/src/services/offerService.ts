import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type {
  Offer,
  CreateOfferRequest,
  UpdateOfferRequest,
  OfferSearchQuery,
  PriceSuggestion,
  OfferStats
} from '../types/offer';

export const offerService = {
  // Get all offers with filtering
  async getOffers(query?: OfferSearchQuery): Promise<{ offers: Offer[]; total: number; page: number; pages: number }> {
    const response = await apiClient.get<{ offers: Offer[]; total: number; page: number; pages: number }>('/offers', query);
    return response.data!;
  },

  // Get offer by ID
  async getOfferById(id: string): Promise<Offer> {
    const response = await apiClient.get<Offer>(`/offers/${id}`);
    return response.data!;
  },

  // Get offers for a specific event
  async getOffersByEvent(eventId: string, query?: Partial<OfferSearchQuery>): Promise<{ offers: Offer[]; total: number }> {
    const response = await apiClient.get<{ offers: Offer[]; total: number }>(`/offers/events/${eventId}`, query);
    return response.data!;
  },

  // Get buyer's own offers
  async getMyOffers(): Promise<Offer[]> {
    const response = await apiClient.get<Offer[]>('/offers/my-offers');
    return response.data!;
  },

  // Create new offer
  async createOffer(offerData: CreateOfferRequest): Promise<Offer> {
    const response = await apiClient.post<Offer>('/offers', offerData);
    return response.data!;
  },

  // Update existing offer
  async updateOffer(id: string, offerData: UpdateOfferRequest): Promise<Offer> {
    const response = await apiClient.put<Offer>(`/offers/${id}`, offerData);
    return response.data!;
  },

  // Cancel offer
  async cancelOffer(id: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/offers/${id}/cancel`);
    return response.data!;
  },

  // Extend offer expiry
  async extendOffer(id: string, newExpiryDate: string): Promise<Offer> {
    const response = await apiClient.post<Offer>(`/offers/${id}/extend`, { expiresAt: newExpiryDate });
    return response.data!;
  },

  // Get offer statistics for an event
  async getOfferStats(eventId: string): Promise<OfferStats> {
    const response = await apiClient.get<OfferStats>(`/offers/stats?eventId=${eventId}`);
    return response.data!;
  },

  // Search offers
  async searchOffers(query: string, filters?: Partial<OfferSearchQuery>): Promise<{ offers: Offer[]; total: number }> {
    const params = { search: query, ...filters };
    const response = await apiClient.get<{ offers: Offer[]; total: number }>('/offers/search', params);
    return response.data!;
  },

  // Get recent offers
  async getRecentOffers(limit: number = 10): Promise<Offer[]> {
    const response = await apiClient.get<Offer[]>(`/offers/recent?limit=${limit}`);
    return response.data!;
  },

  // Get price suggestions for an event (enhanced frontend calculation)
  async getPriceSuggestions(eventId: string, sectionIds?: string[]): Promise<PriceSuggestion> {
    try {
      // Get offer stats for the event
      const offerStats = await this.getOfferStats(eventId);
      
      // Get recent offers to analyze trends
      const recentOffers = await this.getOffersByEvent(eventId, { 
        limit: 50, 
        status: 'ACTIVE' 
      });
      
      // Get event stats for additional context
      const eventResponse = await apiClient.get<{
        totalOffers: number;
        totalListings: number;
        averageOfferPrice: number;
        averageListingPrice: number;
      }>(`/events/${eventId}/stats`);
      
      const eventStats = eventResponse.data!;
      
      // Calculate price suggestions based on available data
      const prices = recentOffers.offers
        .filter(offer => !sectionIds || offer.sections?.some(s => sectionIds.includes(s.sectionId)))
        .map(offer => offer.maxPrice)
        .sort((a, b) => a - b);
      
      if (prices.length === 0) {
        // No data available, use basic estimates
        const basePrice = eventStats.averageListingPrice || eventStats.averageOfferPrice || 100;
        return {
          suggestedPrice: Math.round(basePrice * 0.85), // Suggest 15% below listing average
          averagePrice: basePrice,
          medianPrice: basePrice,
          minPrice: Math.round(basePrice * 0.5),
          maxPrice: Math.round(basePrice * 1.5),
          totalOffers: offerStats.totalOffers,
          recentOffers: recentOffers.offers.length,
          priceRange: {
            low: Math.round(basePrice * 0.6),
            high: Math.round(basePrice * 1.2)
          }
        };
      }

      // Calculate statistics from recent offers
      const sum = prices.reduce((a, b) => a + b, 0);
      const average = sum / prices.length;
      const median = prices[Math.floor(prices.length / 2)];
      const min = prices[0];
      const max = prices[prices.length - 1];
      
      // Calculate suggested price (75th percentile of recent offers)
      const percentile75Index = Math.floor(prices.length * 0.75);
      const suggestedPrice = prices[percentile75Index] || average;
      
      // Calculate competitive range
      const percentile25Index = Math.floor(prices.length * 0.25);
      const low = prices[percentile25Index] || min;
      const high = prices[Math.floor(prices.length * 0.9)] || max;

      return {
        suggestedPrice: Math.round(suggestedPrice),
        averagePrice: Math.round(average),
        medianPrice: Math.round(median),
        minPrice: min,
        maxPrice: max,
        totalOffers: offerStats.totalOffers,
        recentOffers: recentOffers.offers.length,
        priceRange: {
          low: Math.round(low),
          high: Math.round(high)
        }
      };
    } catch (error) {
      console.error('Error fetching price suggestions:', error);
      // Return default suggestions if API calls fail
      return {
        suggestedPrice: 100,
        averagePrice: 100,
        medianPrice: 100,
        minPrice: 50,
        maxPrice: 200,
        totalOffers: 0,
        recentOffers: 0,
        priceRange: {
          low: 75,
          high: 150
        }
      };
    }
  }
};