import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Grid, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { eventService } from '../../services/eventService';
import { listingServiceWithAlerts } from '../../services/listingServiceWithAlerts';
import type { Event, EventSection } from '../../types/event';
import type { CreateListingRequest } from '../../types/listing';

const createListingSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  sectionId: z.string().min(1, 'Section is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 tickets per listing'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  seatNumbers: z.string().optional(),
  row: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

interface CreateListingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultEventId?: string;
}

export const CreateListingForm: React.FC<CreateListingFormProps> = ({
  onSuccess,
  onCancel,
  defaultEventId,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [sections, setSections] = useState<EventSection[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId || '');
  const [ticketFiles, setTicketFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      eventId: defaultEventId || '',
      quantity: 1,
      price: 0,
    },
  });

  const watchedEventId = watch('eventId');
  const watchedQuantity = watch('quantity');
  const watchedPrice = watch('price');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (watchedEventId) {
      setSelectedEventId(watchedEventId);
      fetchEventSections(watchedEventId);
    }
  }, [watchedEventId]);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      console.log('Loading demo events...');
      
      // Mock events data for demo
      const mockEvents = [
        {
          id: '1',
          name: 'Concert at Madison Square Garden',
          date: '2024-02-15T19:00:00Z',
          venue: 'Madison Square Garden',
          city: 'New York',
          state: 'NY',
          description: 'Amazing concert event'
        },
        {
          id: '2',
          name: 'NBA Finals Game 7',
          date: '2024-03-20T20:00:00Z',
          venue: 'Staples Center',
          city: 'Los Angeles',
          state: 'CA',
          description: 'Championship game'
        },
        {
          id: '3',
          name: 'Broadway Show - Hamilton',
          date: '2024-02-28T19:30:00Z',
          venue: 'Richard Rodgers Theatre',
          city: 'New York',
          state: 'NY',
          description: 'Broadway musical'
        }
      ];
      
      setTimeout(() => {
        setEvents(mockEvents);
        setEventsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      setEventsLoading(false);
    }
  };

  const fetchEventSections = async (eventId: string) => {
    try {
      console.log('Loading demo sections for event:', eventId);
      
      // Mock sections data for demo
      const mockSections = [
        { id: '1', name: 'Floor' },
        { id: '2', name: 'Lower Bowl' },
        { id: '3', name: 'Upper Bowl' },
        { id: '4', name: 'Orchestra' },
        { id: '5', name: 'Mezzanine' },
        { id: '6', name: 'Balcony' }
      ];
      
      setSections(mockSections);
    } catch (error) {
      console.error('Failed to fetch event sections:', error);
      setSections([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketFiles(e.target.files);
  };

  const removeFile = () => {
    setTicketFiles(null);
    const fileInput = document.getElementById('ticketFiles') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: CreateListingFormData) => {
    try {
      setLoading(true);

      // Convert seat numbers string to array
      const seats = data.seatNumbers ? 
        data.seatNumbers.split(',').map(seat => seat.trim()).filter(seat => seat) : 
        [];

      const listingData: CreateListingRequest = {
        eventId: data.eventId,
        sectionId: data.sectionId,
        quantity: data.quantity,
        pricePerTicket: data.price,
        seatNumbers: seats.length > 0 ? seats.join(', ') : undefined,
        row: data.row || undefined,
        notes: data.notes || undefined,
      };

      console.log('Creating listing with data:', listingData);
      
      // For demo purposes, simulate successful creation
      // TODO: Replace with actual API call when backend is ready
      setTimeout(() => {
        console.log('Demo: Listing created successfully');
        reset();
        setTicketFiles(null);
        setLoading(false);
        onSuccess();
      }, 1000);
      
      // Don't execute the finally block since we're handling loading in setTimeout
      return;
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const totalPrice = watchedQuantity * watchedPrice;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Listing</h2>
        <p className="text-gray-600 mt-1">List your tickets for sale on the marketplace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event *
          </label>
          <select
            {...register('eventId')}
            disabled={eventsLoading || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString()} - {event.venue}
              </option>
            ))}
          </select>
          {errors.eventId && (
            <p className="mt-1 text-sm text-red-600">{errors.eventId.message}</p>
          )}
        </div>

        {/* Event Details Preview */}
        {selectedEvent && (
          <Card className="p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-2">{selectedEvent.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📅 {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p>📍 {selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.state}</p>
              <p>💰 Price Range: ${selectedEvent.minPrice} - ${selectedEvent.maxPrice}</p>
            </div>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Section Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.sectionId}>
              <InputLabel>Section *</InputLabel>
              <Select
                {...register('sectionId')}
                disabled={!selectedEventId || loading}
                label="Section *"
              >
                <MenuItem value="">Select a section</MenuItem>
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.sectionId && (
                <FormHelperText>{errors.sectionId.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} md={6}>
            <Input
              type="number"
              label="Quantity *"
              inputProps={{ min: 1, max: 20 }}
              {...register('quantity', { valueAsNumber: true })}
              disabled={loading}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
            />
          </Grid>
        </Grid>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Price Per Ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Ticket ($) *
            </label>
            <Input
              type="number"
              {...register('price', { valueAsNumber: true })}
              disabled={loading}
              sx={{
                '& input': {
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  '&[type=number]': {
                    '-moz-appearance': 'textfield',
                  },
                }
              }}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Total Price Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Price
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-lg font-semibold">
              ${totalPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Seat Numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seat Numbers (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., A1, A2, A3"
              {...register('seatNumbers')}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter specific seat numbers if applicable
            </p>
          </div>

          {/* Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Row (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Row A"
              {...register('row')}
              disabled={loading}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Any additional information about the tickets..."
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Ticket Files Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ticket Files (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="ticketFiles"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload ticket files</span>
                  <input
                    id="ticketFiles"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={loading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, PNG, JPG up to 10MB each
              </p>
            </div>
          </div>

          {ticketFiles && ticketFiles.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {ticketFiles.length} file(s) selected
                  </p>
                  <p className="text-xs text-green-600">
                    {Array.from(ticketFiles).map(f => f.name).join(', ')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !selectedEventId}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </Card>
  );
};