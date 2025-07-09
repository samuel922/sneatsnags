export interface Listing {
  id: string;
  eventId: string;
  event: {
    id: string;
    name: string;
    date: string;
    venue: string;
    city: string;
    state: string;
    imageUrl?: string;
  };
  sellerId: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sectionId?: string;
  section?: {
    id: string;
    name: string;
  };
  quantity: number;
  pricePerTicket: number;
  totalPrice: number;
  seatNumbers?: string;
  row?: string;
  notes?: string;
  ticketFiles: string[];
  isVerified: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export const ListingStatus = {
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED'
} as const;

export type ListingStatus = typeof ListingStatus[keyof typeof ListingStatus];

export interface CreateListingRequest {
  eventId: string;
  sectionId: string;
  row?: string;
  seatNumbers?: string;
  pricePerTicket: number;
  quantity: number;
  notes?: string;
  ticketFiles?: string[];
}

export interface UpdateListingRequest {
  price?: number;
  notes?: string;
  status?: ListingStatus;
}

export interface ListingFilters {
  eventId?: string;
  sectionId?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  quantity?: number;
  isVerified?: boolean;
}