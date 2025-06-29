import { PaginationQuery } from "./api";

export interface CreateOfferRequest {
  eventId: string;
  sectionIds: string[];
  maxPrice: number;
  quantity: number;
  message?: string;
  expiresAt: Date;
}

export interface UpdateOfferRequest {
  maxPrice?: number;
  message?: string;
  expiresAt?: Date;
}

export interface OfferSearchQuery extends PaginationQuery {
  eventId?: string;
  status?: "ACTIVE" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  minPrice?: number;
  maxPrice?: number;
  buyerId?: string;
}
