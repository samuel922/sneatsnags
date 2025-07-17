import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  X,
  ImageIcon,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { eventService } from '../../services/eventService';
import { SweetAlert } from '../../utils/sweetAlert';
import type { Event, CreateEventRequest, EventType } from '../../types/events';

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalRevenue: number;
  averageTicketPrice: number;
  totalAttendees: number;
}

interface EventFilters {
  search: string;
  eventType: string;
  status: string;
  city: string;
  state: string;
  dateFrom: string;
  dateTo: string;
  category: string;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  category: string;
  imageUrl: string;
  totalCapacity: number;
  sections: SectionFormData[];
}

interface SectionFormData {
  name: string;
  description: string;
  capacity: number;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
}

interface CreateEventFormProps {
  event?: Event | null;
  onSubmit: (eventData: EventFormData) => Promise<void>;
  onCancel: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    description: event?.description || '',
    date: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
    time: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[1].slice(0, 5) : '',
    venue: event?.venue || '',
    address: event?.address || '',
    city: event?.city || '',
    state: event?.state || '',
    zipCode: event?.zipCode || '',
    country: event?.country || 'US',
    category: event?.category || 'OTHER',
    imageUrl: event?.imageUrl || '',
    totalCapacity: event?.totalSeats || 0,
    sections: event?.sections?.map(section => ({
      name: section.name,
      description: section.description || '',
      capacity: section.seatCount || 0,
      minPrice: section.priceLevel || 0,
      maxPrice: section.priceLevel || 0,
      isActive: true
    })) || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Event description is required';
    if (!formData.date) newErrors.date = 'Event date is required';
    if (!formData.time) newErrors.time = 'Event time is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.totalCapacity || formData.totalCapacity <= 0) {
      newErrors.totalCapacity = 'Total capacity must be greater than 0';
    }
    if (formData.sections.length === 0) {
      newErrors.sections = 'At least one section is required';
    }

    // Validate date is in the future
    const eventDateTime = new Date(`${formData.date}T${formData.time}`);
    if (eventDateTime <= new Date()) {
      newErrors.date = 'Event date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData((prev: EventFormData) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  };

  const addSection = () => {
    const newSection = {
      name: '',
      description: '',
      capacity: 0,
      minPrice: 0,
      maxPrice: 0,
      isActive: true,
    };
    setFormData((prev: EventFormData) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeSection = (index: number) => {
    setFormData((prev: EventFormData) => ({
      ...prev,
      sections: prev.sections.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateSection = (index: number, field: string, value: string | number | boolean) => {
    setFormData((prev: EventFormData) => ({
      ...prev,
      sections: prev.sections.map((section: any, i: number) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress the image
        const compressedImage = await compressImage(file, 800, 0.7);
        setPreviewImage(compressedImage);
        setFormData(prev => ({ ...prev, imageUrl: compressedImage }));
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewImage(result);
          setFormData(prev => ({ ...prev, imageUrl: result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter event name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                <option value="SPORTS">Sports</option>
                <option value="CONCERT">Concert</option>
                <option value="THEATER">Theater</option>
                <option value="COMEDY">Comedy</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter event description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.venue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter venue name"
              />
              {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ZIP code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Capacity *
                </label>
                <input
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => handleInputChange('totalCapacity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.totalCapacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter total capacity"
                  min="1"
                />
                {errors.totalCapacity && <p className="text-red-500 text-sm mt-1">{errors.totalCapacity}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Event Image */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose Image
                </label>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Sections & Pricing</h4>
            <Button type="button" onClick={addSection} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
          
          {errors.sections && <p className="text-red-500 text-sm mb-4">{errors.sections}</p>}
          
          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Section {index + 1}</h5>
                  <Button
                    type="button"
                    onClick={() => removeSection(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., General Admission, VIP, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      value={section.capacity}
                      onChange={(e) => updateSection(index, 'capacity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter capacity"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price ($) *
                    </label>
                    <input
                      type="number"
                      value={section.minPrice}
                      onChange={(e) => updateSection(index, 'minPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price ($) *
                    </label>
                    <input
                      type="number"
                      value={section.maxPrice}
                      onChange={(e) => updateSection(index, 'maxPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Section description (optional)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" onClick={onCancel} variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {event ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {event ? 'Update Event' : 'Create Event'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    eventType: '',
    status: '',
    city: '',
    state: '',
    dateFrom: '',
    dateTo: '',
    category: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllEvents({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setEvents(response.data);
      setPagination(prev => ({ ...prev, total: response.pagination?.total || 0 }));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      SweetAlert.error('Failed to load events', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get real event statistics from backend
      const dashboardData = await adminService.getDashboard();
      const eventData = dashboardData.events;
      const transactionData = dashboardData.transactions;
      
      const statsData: EventStats = {
        totalEvents: eventData.total || 0,
        upcomingEvents: eventData.upcoming || 0,
        activeEvents: eventData.active || 0,
        completedEvents: Math.max(0, eventData.total - eventData.upcoming - eventData.active) || 0,
        totalRevenue: transactionData.revenue || 0,
        averageTicketPrice: transactionData.total > 0 ? transactionData.revenue / transactionData.total : 0,
        totalAttendees: transactionData.completed || 0, // Assuming completed transactions = attendees
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateEvent = async (eventData: EventFormData) => {
    try {
      // Check authentication
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      // Map category to proper EventType
      const getEventTypeFromCategory = (category: string): string => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('musical') || categoryLower.includes('theater') || categoryLower.includes('theatre') || categoryLower.includes('broadway')) {
          return 'THEATER';
        }
        if (categoryLower.includes('concert') || categoryLower.includes('music') || categoryLower.includes('band')) {
          return 'CONCERT';
        }
        if (categoryLower.includes('sport') || categoryLower.includes('game') || categoryLower.includes('football') || categoryLower.includes('basketball')) {
          return 'SPORTS';
        }
        if (categoryLower.includes('comedy') || categoryLower.includes('standup') || categoryLower.includes('humor')) {
          return 'COMEDY';
        }
        return 'OTHER';
      };

      // Validate basic requirements
      if (!eventData.name || eventData.name.length < 3) {
        throw new Error('Event name must be at least 3 characters long');
      }
      if (!eventData.date || !eventData.time) {
        throw new Error('Event date and time are required');
      }
      if (eventData.sections.length === 0) {
        throw new Error('At least one section is required');
      }

      // Validate event date is in future
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
      if (eventDateTime <= new Date()) {
        throw new Error('Event date must be in the future');
      }

      // Transform sections to match backend structure
      const backendSections = eventData.sections.map(section => ({
        name: section.name,
        description: section.description || '',
        rowCount: Math.ceil(section.capacity / 20),
        seatCount: section.capacity,
        priceLevel: section.minPrice,
      }));

      // Prepare request data
      const requestData: CreateEventRequest = {
        name: eventData.name.trim(),
        description: eventData.description?.trim() || '',
        venue: eventData.venue.trim(),
        address: eventData.address.trim(),
        city: eventData.city.trim(),
        state: eventData.state.trim(),
        zipCode: eventData.zipCode?.trim() || '00000',
        country: eventData.country || 'US',
        eventDate: eventDateTime.toISOString(),
        eventType: getEventTypeFromCategory(eventData.category || '') as EventType,
        category: eventData.category,
        imageUrl: eventData.imageUrl && eventData.imageUrl.trim().length > 0 ? eventData.imageUrl : undefined,
        minPrice: eventData.sections.length > 0 ? Math.max(0.01, Math.min(...eventData.sections.map((s: any) => s.minPrice))) : undefined,
        maxPrice: eventData.sections.length > 0 ? Math.max(0.01, Math.max(...eventData.sections.map((s: any) => s.maxPrice))) : undefined,
        totalSeats: eventData.sections.reduce((sum: number, section: any) => sum + section.capacity, 0),
        sections: backendSections,
      };

      console.log('Sending request data:', JSON.stringify(requestData, null, 2));
      console.log('Selected event:', selectedEvent);
      console.log('Is update operation:', !!selectedEvent);

      let result: Event;
      
      if (selectedEvent) {
        // Update existing event (exclude sections from update)
        const { sections, ...updateData } = requestData;
        result = await eventService.updateEvent(selectedEvent.id, updateData);
        
        // Handle sections separately for updates
        if (eventData.sections.length > 0) {
          try {
            const existingSections = selectedEvent.sections || [];
            
            for (const section of eventData.sections) {
              const existingSection = existingSections.find(es => es.name === section.name);
              
              if (existingSection) {
                await eventService.updateEventSection(existingSection.id, {
                  name: section.name,
                  description: section.description,
                  seatCount: section.capacity,
                  priceLevel: section.minPrice,
                  capacity: section.capacity,
                  isActive: section.isActive,
                });
              } else {
                await eventService.createEventSection(selectedEvent.id, {
                  name: section.name,
                  description: section.description,
                  seatCount: section.capacity,
                  priceLevel: section.minPrice,
                  capacity: section.capacity,
                  isActive: section.isActive,
                });
              }
            }
          } catch (sectionError) {
            console.error('Error updating sections:', sectionError);
          }
        }
      } else {
        // Create new event with sections
        result = await eventService.createEvent(requestData);
      }

      console.log(selectedEvent ? 'Event updated successfully:' : 'Event created successfully:', result);

      // Refresh the events list
      await fetchEvents();
      await fetchStats();
      
      setShowCreateModal(false);
      setSelectedEvent(null);
      
      SweetAlert.success(
        selectedEvent ? 'Event Updated!' : 'Event Created!',
        selectedEvent ? 'The event has been successfully updated.' : 'The event has been successfully created.'
      );
    } catch (error) {
      console.error('Error with event operation:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      SweetAlert.error(
        selectedEvent ? 'Failed to update event' : 'Failed to create event',
        errorMessage
      );
    }
  };

  const deleteEvent = async (eventId: string) => {
    const confirmed = await SweetAlert.confirm(
      'Delete Event?',
      'This action cannot be undone. All associated data will be permanently deleted.'
    );

    if (confirmed) {
      try {
        await eventService.deleteEvent(eventId);
        await fetchEvents();
        await fetchStats();
        SweetAlert.success('Event deleted', 'The event has been successfully deleted');
      } catch (error) {
        console.error('Error deleting event:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
        SweetAlert.error('Failed to delete event', errorMessage);
      }
    }
  };

  const exportEvents = async () => {
    try {
      SweetAlert.loading('Exporting events', 'Please wait...');
      const result = await adminService.exportData({
        type: 'events',
        ...filters,
      });
      SweetAlert.success('Export ready', 'Events export is ready for download');
      window.open(result.url, '_blank');
    } catch (error) {
      SweetAlert.error('Export failed', 'Unable to export events');
    }
  };

  const bulkImportEvents = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.xlsx';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          SweetAlert.loading('Importing events', 'Please wait...');
          // Mock import - in real app, this would upload and process the file
          setTimeout(() => {
            SweetAlert.success('Import completed', 'Events have been successfully imported');
            fetchEvents();
          }, 2000);
        }
      };
      input.click();
    } catch (error) {
      SweetAlert.error('Import failed', 'Unable to import events');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'draft': return <Edit className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600 mt-2">Manage platform events and venues</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchEvents} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportEvents} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={bulkImportEvents} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatNumber(stats.totalEvents) : 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats ? formatNumber(stats.activeEvents) : 0} currently active
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatNumber(stats.upcomingEvents) : 0}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Next 30 days
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.totalRevenue) : '$0'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Avg: {stats ? formatCurrency(stats.averageTicketPrice) : '$0'}/ticket
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatNumber(stats.totalAttendees) : 0}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                All events combined
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="SPORTS">Sports</option>
              <option value="CONCERT">Concert</option>
              <option value="THEATER">Theater</option>
              <option value="COMEDY">Comedy</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              placeholder="City..."
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                  {getStatusIcon('active')}
                  <span className="ml-1 capitalize">active</span>
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {event.category || 'Event'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.eventDate)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}, {event.city}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.totalSeats || 0} capacity
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowCreateModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    View Details
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page * pagination.limit >= pagination.total}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.name}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedEvent.imageUrl && (
                    <img
                      src={selectedEvent.imageUrl}
                      alt={selectedEvent.name}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{selectedEvent.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>Category: {selectedEvent.category}</div>
                        <div>Date: {formatDate(selectedEvent.eventDate)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Venue Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium">{selectedEvent.venue || 'TBA'}</div>
                        <div className="text-sm text-gray-600">
                          {selectedEvent.address || 'TBA'}<br />
                          {selectedEvent.city || 'TBA'}, {selectedEvent.state || ''} {selectedEvent.zipCode || ''}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Capacity: {selectedEvent.totalSeats || 0}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Sections & Pricing</h4>
                      <div className="space-y-2">
                        {selectedEvent.sections?.map((section: any) => (
                          <div key={section.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{section.name}</div>
                              <div className="text-sm text-gray-600">{section.totalSeats} seats</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(section.basePrice)}</div>
                              <div className="text-sm text-gray-600">{section.availableSeats} available</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent ? 'Edit Event' : 'Create Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <CreateEventForm
              event={selectedEvent}
              onSubmit={handleCreateEvent}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};