export interface Offer {
  id: string;
  buyerId: string;
  eventId: string;
  maxPrice: number;
  quantity: number;
  message?: string;
  status: OfferStatus;
  expiresAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  event?: {
    id: string;
    name: string;
    date: string;
    venue: string;
    city: string;
    state: string;
  };
  sections?: OfferSection[];
  transaction?: {
    id: string;
    status: string;
    totalAmount: number;
  };
}

export interface OfferSection {
  id: string;
  offerId: string;
  sectionId: string;
  section?: {
    id: string;
    name: string;
    venueId: string;
  };
}

export type OfferStatus = 'ACTIVE' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export interface CreateOfferRequest {
  eventId: string;
  sectionIds: string[];
  maxPrice: number;
  quantity: number;
  message?: string;
  expiresAt: string;
}

export interface UpdateOfferRequest {
  maxPrice?: number;
  message?: string;
  expiresAt?: string;
}

export interface OfferSearchQuery {
  page?: number;
  limit?: number;
  eventId?: string;
  status?: OfferStatus;
  minPrice?: number;
  maxPrice?: number;
  buyerId?: string;
  city?: string;
  state?: string;
  search?: string;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalOffers: number;
  recentOffers: number;
  priceRange: {
    low: number;
    high: number;
  };
}

export interface OfferStats {
  totalOffers: number;
  averagePrice: number;
  priceDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  popularSections: {
    sectionId: string;
    sectionName: string;
    offerCount: number;
  }[];
}

export interface CreateOfferFormData {
  eventId: string;
  sectionIds: string[];
  maxPrice: string;
  quantity: number;
  message: string;
  expirationDays: number;
}