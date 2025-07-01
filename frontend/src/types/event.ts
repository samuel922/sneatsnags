export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  category: EventCategory;
  imageUrl?: string;
  totalCapacity: number;
  ticketsAvailable: number;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  sections: EventSection[];
  createdAt: string;
  updatedAt: string;
}

export const EventCategory = {
  CONCERT: 'CONCERT',
  SPORTS: 'SPORTS',
  THEATER: 'THEATER',
  COMEDY: 'COMEDY',
  OTHER: 'OTHER'
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

export interface EventSection {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  capacity: number;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  category: EventCategory;
  imageUrl?: string;
  totalCapacity: number;
  sections: Omit<EventSection, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>[];
}

export interface EventFilters {
  category?: EventCategory;
  city?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}