// Event Management Types and Interfaces

export type EventType = 'SPORTS' | 'CONCERT' | 'THEATER' | 'COMEDY' | 'OTHER';
export type EventStatus = 'ACTIVE' | 'CANCELLED' | 'POSTPONED' | 'COMPLETED';

// Core Event Interface
export interface Event {
  id: string;
  name: string;
  description?: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  eventDate: string;
  doors?: string;
  eventType: EventType;
  category?: string;
  subcategory?: string;
  imageUrl?: string;
  minPrice: number;
  maxPrice: number;
  totalSeats: number;
  availableSeats: number;
  ticketmasterId?: string;
  status: EventStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: EventSection[];
  stats?: EventStats;
}

// Event Section Interface
export interface EventSection {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  rowCount?: number;
  seatCount?: number;
  priceLevel?: number;
  capacity: number;
  isActive: boolean;
}

// Event Statistics Interface
export interface EventStats {
  totalOffers: number;
  totalListings: number;
  totalTransactions: number;
  averageOfferPrice: number;
  averageListingPrice: number;
  popularityScore: number;
  bookingRate: number;
}

// Event Creation/Update Forms
export interface CreateEventRequest {
  name: string;
  description?: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  eventDate: string;
  doors?: string;
  eventType: EventType;
  category?: string;
  subcategory?: string;
  imageUrl?: string;
  minPrice?: number;
  maxPrice?: number;
  totalSeats?: number;
  availableSeats?: number;
  ticketmasterId?: string;
  status?: EventStatus;
  isActive?: boolean;
  sections: CreateSectionRequest[];
}

export interface CreateSectionRequest {
  name: string;
  description?: string;
  rowCount?: number;
  seatCount?: number;
  priceLevel?: number;
}

export interface UpdateEventRequest extends Partial<Omit<CreateEventRequest, 'sections'>> {}

// Search and Filter Interfaces
export interface EventSearchQuery {
  page?: number;
  limit?: number;
  sortBy?: 'eventDate' | 'name' | 'createdAt' | 'minPrice' | 'maxPrice' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  city?: string;
  state?: string;
  eventType?: EventType;
  category?: string;
  subcategory?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: EventStatus;
  isActive?: boolean;
}

export interface EventFilters {
  search: string;
  city: string;
  state: string;
  eventType: EventType | '';
  category: string;
  dateFrom: string;
  dateTo: string;
  minPrice: number | '';
  maxPrice: number | '';
  status: EventStatus | '';
  isActive: boolean | '';
}

// API Response Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form State Interfaces
export interface EventFormData {
  // Basic Information
  name: string;
  description: string;
  eventType: EventType;
  category: string;
  subcategory: string;
  
  // Location
  venue: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Date & Time
  eventDate: string;
  eventTime: string;
  doors: string;
  doorsTime: string;
  
  // Pricing & Capacity
  minPrice: number | '';
  maxPrice: number | '';
  totalSeats: number | '';
  availableSeats: number | '';
  
  // Media & External
  imageUrl: string;
  ticketmasterId: string;
  
  // Status
  status: EventStatus;
  isActive: boolean;
  
  // Sections
  sections: EventSectionFormData[];
}

export interface EventSectionFormData {
  id?: string;
  name: string;
  description: string;
  rowCount: number | '';
  seatCount: number | '';
  priceLevel: number | '';
  isNew?: boolean;
  toDelete?: boolean;
}

// Validation Interfaces
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormErrors {
  [key: string]: string | ValidationError[] | FormErrors;
}

// Event Management State
export interface EventState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sortBy: EventSearchQuery['sortBy'];
  sortOrder: EventSearchQuery['sortOrder'];
}

// Event Management Actions
export type EventAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'SET_CURRENT_EVENT'; payload: Event | null }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<EventFilters> }
  | { type: 'SET_PAGINATION'; payload: EventState['pagination'] }
  | { type: 'SET_SORTING'; payload: { sortBy: EventSearchQuery['sortBy']; sortOrder: EventSearchQuery['sortOrder'] } }
  | { type: 'RESET_STATE' };

// Component Props Interfaces
export interface EventListProps {
  events: Event[];
  loading: boolean;
  error: string | null;
  onEventSelect: (event: Event) => void;
  onEventEdit: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  showActions?: boolean;
}

export interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  mode: 'create' | 'edit';
}

export interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: Partial<EventFilters>) => void;
  onReset: () => void;
  loading?: boolean;
}

export interface EventSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading?: boolean;
  placeholder?: string;
}

export interface EventSortingProps {
  sortBy: EventSearchQuery['sortBy'];
  sortOrder: EventSearchQuery['sortOrder'];
  onSortChange: (sortBy: EventSearchQuery['sortBy'], sortOrder: EventSearchQuery['sortOrder']) => void;
}

export interface EventStatsProps {
  stats: EventStats;
  event: Event;
  loading?: boolean;
}

// Hook Interfaces
export interface UseEventManagementReturn {
  state: EventState;
  actions: {
    loadEvents: (query?: EventSearchQuery) => Promise<void>;
    loadEvent: (id: string, includeStats?: boolean) => Promise<Event | null>;
    createEvent: (data: CreateEventRequest) => Promise<Event>;
    updateEvent: (id: string, data: UpdateEventRequest) => Promise<Event>;
    deleteEvent: (id: string) => Promise<void>;
    searchEvents: (query: string) => Promise<Event[]>;
    setFilters: (filters: Partial<EventFilters>) => void;
    setSorting: (sortBy: EventSearchQuery['sortBy'], sortOrder: EventSearchQuery['sortOrder']) => void;
    resetState: () => void;
  };
}

// Utility Types
export type EventTypeOption = {
  value: EventType;
  label: string;
  icon?: string;
};

export type EventStatusOption = {
  value: EventStatus;
  label: string;
  color: string;
};

export type SortOption = {
  value: EventSearchQuery['sortBy'];
  label: string;
};

// Constants
export const EVENT_TYPES: EventTypeOption[] = [
  { value: 'SPORTS', label: 'Sports', icon: '⚽' },
  { value: 'CONCERT', label: 'Concert', icon: '🎵' },
  { value: 'THEATER', label: 'Theater', icon: '🎭' },
  { value: 'COMEDY', label: 'Comedy', icon: '😂' },
  { value: 'OTHER', label: 'Other', icon: '🎪' },
];

export const EVENT_STATUSES: EventStatusOption[] = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'POSTPONED', label: 'Postponed', color: 'orange' },
  { value: 'COMPLETED', label: 'Completed', color: 'blue' },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: 'eventDate', label: 'Event Date' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'minPrice', label: 'Min Price' },
  { value: 'maxPrice', label: 'Max Price' },
  { value: 'popularity', label: 'Popularity' },
];

// Default Values
export const DEFAULT_FILTERS: EventFilters = {
  search: '',
  city: '',
  state: '',
  eventType: '',
  category: '',
  dateFrom: '',
  dateTo: '',
  minPrice: '',
  maxPrice: '',
  status: '',
  isActive: '',
};

export const DEFAULT_EVENT_FORM_DATA: EventFormData = {
  name: '',
  description: '',
  eventType: 'CONCERT',
  category: '',
  subcategory: '',
  venue: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  eventDate: '',
  eventTime: '',
  doors: '',
  doorsTime: '',
  minPrice: '',
  maxPrice: '',
  totalSeats: '',
  availableSeats: '',
  imageUrl: '',
  ticketmasterId: '',
  status: 'ACTIVE',
  isActive: true,
  sections: [],
};

export const DEFAULT_SECTION_FORM_DATA: EventSectionFormData = {
  name: '',
  description: '',
  rowCount: '',
  seatCount: '',
  priceLevel: '',
  isNew: true,
  toDelete: false,
};

// Legacy compatibility - keep for backward compatibility
export const EventCategory = {
  CONCERT: 'CONCERT' as EventType,
  SPORTS: 'SPORTS' as EventType,
  THEATER: 'THEATER' as EventType,
  COMEDY: 'COMEDY' as EventType,
  OTHER: 'OTHER' as EventType
} as const;

export type EventCategory = EventType;