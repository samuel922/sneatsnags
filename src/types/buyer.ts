export interface CreateOfferDTO {
  eventId: string;
  maxPrice: number;
  quantity: number;
  sectionIds: string[];
  message?: string;
  expiresAt: Date;
}

export interface UpdateOfferDTO {
  maxPrice?: number;
  quantity?: number;
  sectionIds?: string[];
  message?: string;
  expiresAt?: Date;
}

export interface OfferResponse {
  id: string;
  eventId: string;
  buyerId: string;
  maxPrice: number;
  quantity: number;
  message?: string | null;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  sectionIds: string[];
}
