import type { EventFormData } from '../types/events';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateEventForm = (formData: EventFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Basic Information
  if (!formData.name || formData.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Event name must be at least 3 characters long' });
  }
  if (formData.name && formData.name.trim().length > 200) {
    errors.push({ field: 'name', message: 'Event name cannot exceed 200 characters' });
  }
  if (!formData.name || !/^[a-zA-Z0-9\s\-:()&.,'!]+$/.test(formData.name.trim())) {
    errors.push({ field: 'name', message: 'Event name contains invalid characters' });
  }

  if (!formData.description || formData.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Event description is required' });
  }
  if (formData.description && formData.description.trim().length > 2000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters' });
  }

  // Location
  if (!formData.venue || formData.venue.trim().length < 2) {
    errors.push({ field: 'venue', message: 'Venue name must be at least 2 characters long' });
  }
  if (formData.venue && formData.venue.trim().length > 200) {
    errors.push({ field: 'venue', message: 'Venue name cannot exceed 200 characters' });
  }

  if (!formData.address || formData.address.trim().length < 5) {
    errors.push({ field: 'address', message: 'Address must be at least 5 characters long' });
  }
  if (formData.address && formData.address.trim().length > 500) {
    errors.push({ field: 'address', message: 'Address cannot exceed 500 characters' });
  }

  if (!formData.city || formData.city.trim().length < 2) {
    errors.push({ field: 'city', message: 'City name must be at least 2 characters long' });
  }
  if (formData.city && formData.city.trim().length > 100) {
    errors.push({ field: 'city', message: 'City name cannot exceed 100 characters' });
  }

  if (!formData.state || formData.state.trim().length < 2) {
    errors.push({ field: 'state', message: 'State name must be at least 2 characters long' });
  }
  if (formData.state && formData.state.trim().length > 100) {
    errors.push({ field: 'state', message: 'State name cannot exceed 100 characters' });
  }

  if (!formData.zipCode || formData.zipCode.trim().length < 3) {
    errors.push({ field: 'zipCode', message: 'ZIP code must be at least 3 characters long' });
  }

  // Date & Time
  if (!formData.eventDate || !formData.eventTime) {
    errors.push({ field: 'eventDate', message: 'Event date and time are required' });
  } else {
    const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
    if (eventDateTime <= new Date()) {
      errors.push({ field: 'eventDate', message: 'Event date must be in the future' });
    }
    
    // Check if date is too far in the future (2 years)
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    if (eventDateTime > twoYearsFromNow) {
      errors.push({ field: 'eventDate', message: 'Event date cannot be more than 2 years in the future' });
    }
  }

  // Sections
  if (!formData.sections || formData.sections.length === 0) {
    errors.push({ field: 'sections', message: 'At least one section is required' });
  } else {
    const sectionNames = formData.sections.map(s => s.name.trim().toLowerCase());
    const uniqueNames = new Set(sectionNames);
    if (sectionNames.length !== uniqueNames.size) {
      errors.push({ field: 'sections', message: 'Section names must be unique' });
    }

    formData.sections.forEach((section, index) => {
      if (!section.name || section.name.trim().length === 0) {
        errors.push({ field: `sections[${index}].name`, message: 'Section name is required' });
      }
      if (typeof section.seatCount === 'number' && section.seatCount <= 0) {
        errors.push({ field: `sections[${index}].seatCount`, message: 'Seat count must be greater than 0' });
      }
      if (typeof section.priceLevel === 'number' && section.priceLevel < 0) {
        errors.push({ field: `sections[${index}].priceLevel`, message: 'Price cannot be negative' });
      }
    });
  }

  // Capacity
  if (typeof formData.totalSeats === 'number' && formData.totalSeats <= 0) {
    errors.push({ field: 'totalSeats', message: 'Total capacity must be greater than 0' });
  }

  // Prices
  if (typeof formData.minPrice === 'number' && formData.minPrice < 0) {
    errors.push({ field: 'minPrice', message: 'Minimum price cannot be negative' });
  }
  if (typeof formData.maxPrice === 'number' && formData.maxPrice < 0) {
    errors.push({ field: 'maxPrice', message: 'Maximum price cannot be negative' });
  }
  if (
    typeof formData.minPrice === 'number' && 
    typeof formData.maxPrice === 'number' && 
    formData.minPrice > formData.maxPrice
  ) {
    errors.push({ field: 'maxPrice', message: 'Maximum price must be greater than or equal to minimum price' });
  }

  // Image URL
  if (formData.imageUrl && formData.imageUrl.trim().length > 0) {
    try {
      new URL(formData.imageUrl);
    } catch {
      // Allow data URLs (base64 images)
      if (!formData.imageUrl.startsWith('data:image/')) {
        errors.push({ field: 'imageUrl', message: 'Image URL must be a valid URL' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeEventData = (formData: EventFormData) => {
  return {
    name: formData.name.trim(),
    description: formData.description.trim(),
    venue: formData.venue.trim(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    zipCode: formData.zipCode.trim(),
    country: formData.country.trim() || 'US',
    eventDate: formData.eventDate,
    eventTime: formData.eventTime,
    eventType: formData.eventType,
    category: formData.category,
    subcategory: formData.subcategory,
    imageUrl: formData.imageUrl.trim(),
    minPrice: formData.minPrice,
    maxPrice: formData.maxPrice,
    totalSeats: formData.totalSeats,
    availableSeats: formData.availableSeats,
    status: formData.status,
    isActive: formData.isActive,
    sections: formData.sections.map(section => ({
      ...section,
      name: section.name.trim(),
      description: section.description.trim()
    }))
  };
};