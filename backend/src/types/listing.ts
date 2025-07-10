import { PaginationQuery } from "./api";

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
  status?: "AVAILABLE" | "SOLD" | "RESERVED" | "EXPIRED" | "CANCELLED";
}

export interface ListingSearchQuery extends PaginationQuery {
  eventId?: string;
  sectionId?: string;
  status?: "AVAILABLE" | "SOLD" | "RESERVED" | "EXPIRED" | "CANCELLED";
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
}
