import { apiClient } from './api';
import type { Event, CreateEventRequest, UpdateEventRequest, EventSection } from '../types/events';
import { validateEventForm, sanitizeEventData, type ValidationResult } from '../utils/eventValidation';

export class EventServiceV2 {
  private baseUrl = '/events';

  /**
   * Create a new event
   */
  async createEvent(eventData: any): Promise<Event> {
    try {
      console.log('Creating event with data:', eventData);
      
      // Validate form data
      const validation = validateEventForm(eventData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Sanitize data
      const sanitizedData = sanitizeEventData(eventData);
      
      // Transform to backend format
      const requestData = this.transformToBackendFormat(sanitizedData);
      
      console.log('Sending create request:', requestData);
      
      const response = await apiClient.post<Event>(this.baseUrl, requestData);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('Create event error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, eventData: any): Promise<Event> {
    try {
      console.log('Updating event with ID:', eventId, 'Data:', eventData);
      
      // For updates, we only validate and send the fields that are provided
      const updateData = this.transformToUpdateFormat(eventData);
      
      console.log('Sending update request:', JSON.stringify(updateData, null, 2));
      console.log('Original event data:', JSON.stringify(eventData, null, 2));
      
      const response = await apiClient.put<Event>(`${this.baseUrl}/${eventId}`, updateData);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('Update event error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Transform form data to backend format for creation
   */
  private transformToBackendFormat(formData: any): CreateEventRequest {
    const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
    
    // Validate the date is valid
    if (isNaN(eventDateTime.getTime())) {
      throw new Error(`Invalid date/time: ${formData.eventDate}T${formData.eventTime}`);
    }
    
    return {
      name: formData.name,
      description: formData.description,
      venue: formData.venue,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      eventDate: eventDateTime.toISOString(),
      eventType: formData.eventType,
      category: formData.category,
      subcategory: formData.subcategory,
      imageUrl: formData.imageUrl || undefined,
      minPrice: typeof formData.minPrice === 'number' ? formData.minPrice : undefined,
      maxPrice: typeof formData.maxPrice === 'number' ? formData.maxPrice : undefined,
      totalSeats: typeof formData.totalSeats === 'number' ? formData.totalSeats : undefined,
      availableSeats: typeof formData.availableSeats === 'number' ? formData.availableSeats : undefined,
      status: formData.status,
      isActive: formData.isActive,
      sections: formData.sections.map((section: any) => ({
        name: section.name,
        description: section.description,
        rowCount: section.rowCount || Math.ceil((section.seatCount || section.capacity) / 20),
        seatCount: section.seatCount || section.capacity,
        priceLevel: section.priceLevel || section.minPrice || 0
      }))
    };
  }

  /**
   * Transform form data to backend format for updates
   */
  private transformToUpdateFormat(formData: any): UpdateEventRequest {
    const updateData: any = {};
    
    if (formData.name) updateData.name = formData.name;
    if (formData.description) updateData.description = formData.description;
    if (formData.venue) updateData.venue = formData.venue;
    if (formData.address) updateData.address = formData.address;
    if (formData.city) updateData.city = formData.city;
    if (formData.state) updateData.state = formData.state;
    if (formData.zipCode) updateData.zipCode = formData.zipCode;
    if (formData.country) updateData.country = formData.country;
    if (formData.eventDate) {
      try {
        const timeString = formData.eventTime || '12:00';
        const eventDateTime = new Date(`${formData.eventDate}T${timeString}`);
        
        // Validate the date is valid
        if (isNaN(eventDateTime.getTime())) {
          throw new Error(`Invalid date/time: ${formData.eventDate}T${timeString}`);
        }
        
        updateData.eventDate = eventDateTime.toISOString();
      } catch (error) {
        console.error('Date parsing error:', error);
        throw new Error(`Invalid date format: ${formData.eventDate}`);
      }
    }
    if (formData.eventType) updateData.eventType = formData.eventType;
    if (formData.category) updateData.category = formData.category;
    if (formData.subcategory) updateData.subcategory = formData.subcategory;
    if (formData.imageUrl !== undefined) updateData.imageUrl = formData.imageUrl;
    if (typeof formData.minPrice === 'number') updateData.minPrice = formData.minPrice;
    if (typeof formData.maxPrice === 'number') updateData.maxPrice = formData.maxPrice;
    if (typeof formData.totalSeats === 'number') updateData.totalSeats = formData.totalSeats;
    if (typeof formData.availableSeats === 'number') updateData.availableSeats = formData.availableSeats;
    if (formData.status) updateData.status = formData.status;
    if (typeof formData.isActive === 'boolean') updateData.isActive = formData.isActive;
    
    return updateData;
  }

  /**
   * Handle sections separately for updates
   */
  async updateEventSections(eventId: string, sections: any[]): Promise<void> {
    try {
      // Get current sections
      const currentSections = await this.getEventSections(eventId);
      
      // Update or create sections
      for (const section of sections) {
        const existingSection = currentSections.find(s => s.name === section.name);
        
        if (existingSection) {
          // Update existing section
          await this.updateEventSection(existingSection.id, {
            name: section.name,
            description: section.description,
            seatCount: section.capacity,
            priceLevel: section.minPrice,
            capacity: section.capacity,
            isActive: section.isActive
          });
        } else {
          // Create new section
          await this.createEventSection(eventId, {
            name: section.name,
            description: section.description,
            seatCount: section.capacity,
            priceLevel: section.minPrice,
            capacity: section.capacity,
            isActive: section.isActive
          });
        }
      }
    } catch (error) {
      console.error('Error updating sections:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get event sections
   */
  async getEventSections(eventId: string): Promise<EventSection[]> {
    try {
      const response = await apiClient.get<EventSection[]>(`${this.baseUrl}/${eventId}/sections`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting sections:', error);
      return [];
    }
  }

  /**
   * Create event section
   */
  async createEventSection(eventId: string, sectionData: any): Promise<EventSection> {
    const response = await apiClient.post<EventSection>(
      `${this.baseUrl}/${eventId}/sections`,
      sectionData
    );
    return response.data!;
  }

  /**
   * Update event section
   */
  async updateEventSection(sectionId: string, sectionData: any): Promise<EventSection> {
    const response = await apiClient.put<EventSection>(
      `${this.baseUrl}/sections/${sectionId}`,
      sectionData
    );
    return response.data!;
  }

  /**
   * Enhanced error handling
   */
  private handleError(error: any): Error {
    console.error('EventServiceV2 error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('400 Error details:', data);
          if (data?.error) {
            return new Error(`Validation Error: ${data.error}`);
          }
          if (data?.details) {
            const details = Array.isArray(data.details) 
              ? data.details.map((d: any) => d.message || d).join(', ')
              : JSON.stringify(data.details);
            return new Error(`Validation Error: ${details}`);
          }
          if (data?.message) {
            return new Error(`Validation Error: ${data.message}`);
          }
          return new Error(`Invalid request data: ${JSON.stringify(data)}`);
          
        case 401:
          return new Error('Authentication required. Please log in again.');
          
        case 403:
          return new Error('Insufficient permissions to perform this action');
          
        case 404:
          return new Error('Event not found');
          
        case 409:
          return new Error('Event already exists or conflicts with existing data');
          
        case 500:
          return new Error('Server error. Please try again later.');
          
        default:
          return new Error(`Request failed with status ${status}`);
      }
    }
    
    if (error.message?.includes('timeout')) {
      return new Error('Request timed out. Please try again.');
    }
    
    if (error.message?.includes('Network Error')) {
      return new Error('Network error. Please check your connection.');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const eventServiceV2 = new EventServiceV2();