import { apiClient } from './api';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventSearchQuery,
  EventStats,
  ApiResponse,
  PaginatedResponse,
} from '../types/events';

// Event API Service Class
export class EventService {
  private readonly baseUrl = '/events';

  /**
   * Get events with filtering and pagination
   */
  async getEvents(query: EventSearchQuery = {}): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>(this.baseUrl, query);
      return response.data!;
    } catch (error) {
      throw this.handleError(error, 'getEvents');
    }
  }

  /**
   * Get a single event by ID
   */
  async getEventById(id: string, includeStats = false): Promise<Event> {
    try {
      const params = includeStats ? { includeStats: 'true' } : {};
      const response = await apiClient.get<ApiResponse<Event>>(`${this.baseUrl}/${id}`, params);
      
      if (!response.data?.data) {
        throw new Error('Event not found');
      }
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'getEventById');
    }
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    try {
      const response = await apiClient.post<ApiResponse<Event>>(this.baseUrl, data);
      
      if (!response.data?.data) {
        throw new Error('Failed to create event');
      }
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'createEvent');
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    try {
      const response = await apiClient.put<ApiResponse<Event>>(`${this.baseUrl}/${id}`, data);
      
      if (!response.data?.data) {
        throw new Error('Failed to update event');
      }
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'updateEvent');
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw this.handleError(error, 'deleteEvent');
    }
  }

  /**
   * Search events
   */
  async searchEvents(query: string, filters: Partial<EventSearchQuery> = {}): Promise<Event[]> {
    try {
      const params = { q: query, ...filters };
      const response = await apiClient.get<PaginatedResponse<Event>>(`${this.baseUrl}/search`, params);
      return response.data?.data || [];
    } catch (error) {
      throw this.handleError(error, 'searchEvents');
    }
  }

  /**
   * Get popular events
   */
  async getPopularEvents(limit = 10): Promise<Event[]> {
    try {
      const response = await apiClient.get<ApiResponse<Event[]>>(`${this.baseUrl}/popular`, { limit });
      return response.data?.data || [];
    } catch (error) {
      throw this.handleError(error, 'getPopularEvents');
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit = 10, city?: string, state?: string): Promise<Event[]> {
    try {
      const params = { limit, ...(city && { city }), ...(state && { state }) };
      const response = await apiClient.get<ApiResponse<Event[]>>(`${this.baseUrl}/upcoming`, params);
      return response.data?.data || [];
    } catch (error) {
      throw this.handleError(error, 'getUpcomingEvents');
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    try {
      const response = await apiClient.get<ApiResponse<EventStats>>(`${this.baseUrl}/${eventId}/stats`);
      
      if (!response.data?.data) {
        throw new Error('Failed to get event statistics');
      }
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'getEventStats');
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiClient.get<ApiResponse<{ status: string; timestamp: string }>>(
        `${this.baseUrl}/health/check`
      );
      return response.data?.data || { status: 'unknown', timestamp: new Date().toISOString() };
    } catch (error) {
      throw this.handleError(error, 'healthCheck');
    }
  }

  /**
   * Handle API errors and transform them into user-friendly messages
   */
  private handleError(error: any, operation: string): Error {
    console.error(`EventService.${operation} failed:`, error);

    // Extract error information from the response
    const errorData = error.response?.data;
    const status = error.response?.status;
    const statusText = error.response?.statusText;

    // Handle specific error types
    if (errorData?.success === false) {
      return new EventServiceError(
        errorData.error || 'An error occurred',
        errorData.code || 'UNKNOWN_ERROR',
        errorData.details,
        status,
        operation
      );
    }

    // Handle HTTP status codes
    switch (status) {
      case 400:
        return new EventServiceError(
          'Invalid request data',
          'VALIDATION_ERROR',
          errorData,
          status,
          operation
        );
      case 401:
        return new EventServiceError(
          'Authentication required',
          'UNAUTHORIZED',
          null,
          status,
          operation
        );
      case 403:
        return new EventServiceError(
          'Insufficient permissions',
          'FORBIDDEN',
          null,
          status,
          operation
        );
      case 404:
        return new EventServiceError(
          'Resource not found',
          'NOT_FOUND',
          null,
          status,
          operation
        );
      case 409:
        return new EventServiceError(
          'Resource already exists or conflicts with existing data',
          'CONFLICT',
          errorData,
          status,
          operation
        );
      case 422:
        return new EventServiceError(
          'Validation failed',
          'VALIDATION_ERROR',
          errorData,
          status,
          operation
        );
      case 429:
        return new EventServiceError(
          'Rate limit exceeded. Please try again later.',
          'RATE_LIMIT_EXCEEDED',
          errorData,
          status,
          operation
        );
      case 500:
        return new EventServiceError(
          'Internal server error',
          'INTERNAL_SERVER_ERROR',
          null,
          status,
          operation
        );
      case 502:
        return new EventServiceError(
          'Bad gateway',
          'BAD_GATEWAY',
          null,
          status,
          operation
        );
      case 503:
        return new EventServiceError(
          'Service unavailable',
          'SERVICE_UNAVAILABLE',
          null,
          status,
          operation
        );
      default:
        // Network or other errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          return new EventServiceError(
            'Network error. Please check your connection.',
            'NETWORK_ERROR',
            null,
            null,
            operation
          );
        }

        return new EventServiceError(
          error.message || 'An unexpected error occurred',
          'UNKNOWN_ERROR',
          null,
          status,
          operation
        );
    }
  }
}

// Custom Error Class for Event Service
export class EventServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public status?: number,
    public operation?: string
  ) {
    super(message);
    this.name = 'EventServiceError';
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' || this.code === 'EVENT_VALIDATION_ERROR';
  }

  /**
   * Check if this is a permission error
   */
  isPermissionError(): boolean {
    return this.code === 'FORBIDDEN' || this.code === 'UNAUTHORIZED' || this.code === 'EVENT_PERMISSION_ERROR';
  }

  /**
   * Check if this is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.code === 'RATE_LIMIT_EXCEEDED' || this.code === 'EVENT_RATE_LIMIT_ERROR';
  }

  /**
   * Check if this is a network error
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || !this.status;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'EVENT_VALIDATION_ERROR':
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'EVENT_NOT_FOUND':
      case 'NOT_FOUND':
        return 'The requested event was not found.';
      case 'EVENT_ALREADY_EXISTS':
      case 'CONFLICT':
        return 'An event with similar details already exists.';
      case 'EVENT_PERMISSION_ERROR':
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'UNAUTHORIZED':
        return 'Please log in to continue.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'SERVICE_UNAVAILABLE':
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Get validation errors if available
   */
  getValidationErrors(): Array<{ field: string; message: string }> {
    if (!this.isValidationError() || !this.details) {
      return [];
    }

    if (Array.isArray(this.details)) {
      return this.details.map(error => ({
        field: error.field || 'unknown',
        message: error.message || 'Invalid value',
      }));
    }

    return [];
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      status: this.status,
      operation: this.operation,
    };
  }
}

// Utility functions for error handling
export const isEventServiceError = (error: any): error is EventServiceError => {
  return error instanceof EventServiceError;
};

export const handleEventServiceError = (error: any, fallbackMessage = 'An error occurred'): string => {
  if (isEventServiceError(error)) {
    return error.getUserMessage();
  }
  
  if (error.message) {
    return error.message;
  }
  
  return fallbackMessage;
};

// Export singleton instance
export const eventServiceV2 = new EventService();

// Export for named imports
export default eventServiceV2;