export interface CreateOfferDTO {
  eventId: string;
  maxPrice: number;
  quantity: number;
  sectionIds: string[];
  message?: string;
  expiresAt: Date;
}

export interface CreateListingDTO {
  eventId: string;
  sectionId: string;
  row?: string;
  seats: string[];
  price: number;
  quantity: number;
  notes?: string;
  ticketFiles?: string[];
}

export interface BulkListingDTO {
  listings: CreateListingDTO[];
}

export interface AcceptOfferDTO {
  listingId: string;
}

export interface BrokerIntegrationDTO {
  name: string;
  type: "SKYBOX" | "AUTOPROCESSOR" | "TICKET_EVOLUTION" | "CUSTOM_FTP";
  credentials: Record<string, any>;
  syncSchedule: string;
  fieldMappings?: Record<string, any>;
}

// Shape returned from the user profile query
import type { User } from "@prisma/client";

export type UserProfile = Pick<
  User,
  | "id"
  | "email"
  | "firstName"
  | "lastName"
  | "phone"
  | "role"
  | "profileImage"
  | "stripeCustomerId"
  | "stripeAccountId"
  | "isEmailVerified"
  | "lastLoginAt"
  | "createdAt"
>;
