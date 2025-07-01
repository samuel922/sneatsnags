import { apiClient } from './api';
import type { Event, EventSection, CreateEventRequest, EventFilters } from '../types/event';
import type { PaginatedResponse, QueryParams } from '../types/api';

export const eventService = {
  async getEvents(params?: QueryParams & EventFilters): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<PaginatedResponse<Event>>('/events', params);
    return response.data!;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data!;
  },

  async searchEvents(query: string, params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<PaginatedResponse<Event>>('/events/search', {
      query,
      ...params,
    });
    return response.data!;
  },

  async getPopularEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<PaginatedResponse<Event>>('/events/popular', params);
    return response.data!;
  },

  async getUpcomingEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<PaginatedResponse<Event>>('/events/upcoming', params);
    return response.data!;
  },

  async getEventSections(eventId: string): Promise<EventSection[]> {
    const response = await apiClient.get<EventSection[]>(`/events/${eventId}/sections`);
    return response.data!;
  },

  async getEventStats(eventId: string): Promise<any> {
    const response = await apiClient.get(`/events/${eventId}/stats`);
    return response.data!;
  },

  // Admin only methods
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<Event>('/events', eventData);
    return response.data!;
  },

  async updateEvent(id: string, eventData: Partial<CreateEventRequest>): Promise<Event> {
    const response = await apiClient.put<Event>(`/events/${id}`, eventData);
    return response.data!;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async createEventSection(eventId: string, sectionData: Omit<EventSection, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): Promise<EventSection> {
    const response = await apiClient.post<EventSection>(`/events/${eventId}/sections`, sectionData);
    return response.data!;
  },

  async updateEventSection(sectionId: string, sectionData: Partial<EventSection>): Promise<EventSection> {
    const response = await apiClient.put<EventSection>(`/events/sections/${sectionId}`, sectionData);
    return response.data!;
  },

  async deleteEventSection(sectionId: string): Promise<void> {
    await apiClient.delete(`/events/sections/${sectionId}`);
  },
};