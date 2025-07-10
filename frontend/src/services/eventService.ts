import { apiClient } from './api';
import type { Event, EventSection, CreateEventRequest, EventFilters } from '../types/event';
import type { PaginatedResponse, QueryParams } from '../types/api';

export const eventService = {
  async getEvents(params?: QueryParams & EventFilters): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<any>('/events', params);
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async getEventsSilent(params?: QueryParams & EventFilters): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.getSilent<any>('/events', params);
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<any>(`/events/${id}`);
    return response.data?.data || response.data;
  },

  async searchEvents(query: string, params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<any>('/events/search', {
      query,
      ...params,
    });
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async getPopularEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<any>('/events/popular', params);
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async getUpcomingEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<any>('/events/upcoming', params);
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination
    };
  },

  async getEventSections(eventId: string): Promise<EventSection[]> {
    const response = await apiClient.get<any>(`/events/${eventId}/sections`);
    return response.data?.data || response.data || [];
  },

  async getEventStats(eventId: string): Promise<any> {
    const response = await apiClient.get<any>(`/events/${eventId}/stats`);
    return response.data?.data || response.data || {};
  },

  // Admin only methods
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<any>('/events', eventData);
    return response.data?.data || response.data;
  },

  async updateEvent(id: string, eventData: Partial<CreateEventRequest>): Promise<Event> {
    const response = await apiClient.put<any>(`/events/${id}`, eventData);
    return response.data?.data || response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async createEventSection(eventId: string, sectionData: Omit<EventSection, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): Promise<EventSection> {
    const response = await apiClient.post<any>(`/events/${eventId}/sections`, sectionData);
    return response.data?.data || response.data;
  },

  async updateEventSection(sectionId: string, sectionData: Partial<EventSection>): Promise<EventSection> {
    const response = await apiClient.put<any>(`/events/sections/${sectionId}`, sectionData);
    return response.data?.data || response.data;
  },

  async deleteEventSection(sectionId: string): Promise<void> {
    await apiClient.delete(`/events/sections/${sectionId}`);
  },
};