import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Box, 
  Typography, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  TextField, 
  Paper, 
  Divider,
  Alert,
  Chip,
  Stack,
  IconButton,
  CircularProgress
} from "@mui/material";
import { Upload, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { eventService } from "../../services/eventService";
import { sellerService } from '../../services/sellerService';
import type { Event, EventSection } from "../../types/event";
import type { CreateListingRequest } from "../../services/sellerService";
import SweetAlert from "../../utils/sweetAlert";

const createListingSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  sectionId: z.string().min(1, "Section is required"),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(20, "Maximum 20 tickets per listing"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  seatNumbers: z.string().optional(),
  row: z.string().optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
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
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId || "");
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
      eventId: defaultEventId || "",
      quantity: 1,
      price: 0,
    },
  });

  const watchedEventId = watch("eventId");
  const watchedQuantity = watch("quantity");
  const watchedPrice = watch("price");

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
      console.log("Fetching events...");
      const response = await eventService.getEvents({ limit: 100 });
      console.log("Events API response:", response);
      console.log("Events data:", response.data);
      console.log("Number of events:", response.data?.length || 0);
      
      // Debug: Log each event's structure
      response.data?.forEach((event, index) => {
        console.log(`Event ${index}:`, {
          id: event.id,
          name: event.name,
          date: event.date,
          eventDate: event.eventDate,
          venue: event.venue,
          city: event.city,
          state: event.state
        });
      });

      // The eventService returns { data: Event[], pagination: {...} }
      setEvents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      console.error("Error details:", error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchEventSections = async (eventId: string) => {
    try {
      console.log(`Fetching sections for event ID: ${eventId}`);
      const eventSections = await eventService.getEventSections(eventId);
      console.log("Event sections response:", eventSections);
      console.log("Number of sections:", eventSections?.length || 0);
      
      // Debug: Log each section's structure
      eventSections?.forEach((section, index) => {
        console.log(`Section ${index}:`, {
          id: section.id,
          name: section.name,
          eventId: section.eventId,
          description: section.description
        });
      });
      
      setSections(eventSections);
    } catch (error) {
      console.error("Failed to fetch event sections:", error);
      setSections([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketFiles(e.target.files);
  };

  const removeFile = () => {
    setTicketFiles(null);
    const fileInput = document.getElementById(
      "ticketFiles"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: CreateListingFormData) => {
    try {
      setLoading(true);

      // Convert seat numbers string to array
      const seats = data.seatNumbers
        ? data.seatNumbers
            .split(",")
            .map((seat) => seat.trim())
            .filter((seat) => seat)
        : [];

      const listingData: CreateListingRequest = {
        eventId: data.eventId,
        sectionId: data.sectionId,
        quantity: data.quantity,
        price: data.price,
        seats,
        row: data.row || undefined,
        notes: data.notes || undefined,
      };

      console.log("Form data:", data);
      console.log("Listing data to be sent:", listingData);
      console.log("Selected event ID:", data.eventId);
      console.log("Selected section ID:", data.sectionId);
      
      // Verify the selected event and section exist
      const selectedEvent = events.find(e => e.id === data.eventId);
      const selectedSection = sections.find(s => s.id === data.sectionId);
      console.log("Selected event:", selectedEvent);
      console.log("Selected section:", selectedSection);
      
      if (!selectedEvent) {
        throw new Error("Selected event not found");
      }
      
      if (!selectedSection) {
        throw new Error("Selected section not found");
      }
      
      if (selectedSection.eventId !== data.eventId) {
        throw new Error(`Section ${selectedSection.id} does not belong to event ${data.eventId}`);
      }

      SweetAlert.loading('Creating Listing', 'Please wait while we create your listing...');
      
      const listing = await sellerService.createListing(listingData);

      // Upload ticket files if provided
      if (ticketFiles && ticketFiles.length > 0) {
        const files = Array.from(ticketFiles);
        await sellerService.uploadTicketFiles(listing.id, files);
      }

      SweetAlert.close();
      SweetAlert.success('Listing Created!', 'Your listing has been created successfully and is now live on the marketplace');

      reset();
      setTicketFiles(null);
      onSuccess();
    } catch (error: unknown) {
      console.error("Failed to create listing:", error);
      SweetAlert.close();
      
      const apiError = error as { status?: number; message?: string };
      
      if (apiError.status === 400) {
        SweetAlert.error('Invalid Data', apiError.message || 'Please check your listing details and try again');
      } else if (apiError.status === 409) {
        SweetAlert.warning('Duplicate Listing', 'You already have a listing for these seats');
      } else {
        SweetAlert.error('Creation Failed', 'Failed to create your listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const totalPrice = watchedQuantity * watchedPrice;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600, 
              mb: 1, 
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Create Listing
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Add your tickets to the marketplace
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Event Selection */}
              <FormControl fullWidth error={!!errors.eventId}>
                <InputLabel>Event</InputLabel>
                <Select
                  {...register("eventId")}
                  disabled={eventsLoading || loading}
                  value={watchedEventId}
                  label="Event"
                  sx={{ borderRadius: 2 }}
                >
                  {eventsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      Loading events...
                    </MenuItem>
                  ) : (
                    events.map((event) => (
                      <MenuItem key={event.id} value={event.id}>
                        {event.name} - {new Date(event.date).toLocaleDateString()} - {event.venue}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.eventId && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.eventId.message}
                  </Typography>
                )}
              </FormControl>

              {/* Event Details Preview */}
              {selectedEvent && (
                <Card variant="gradient" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {selectedEvent.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Chip 
                        label={new Date(selectedEvent.date).toLocaleDateString()}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.state}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${selectedEvent.minPrice} - ${selectedEvent.maxPrice}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Section and Quantity */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: 1, minWidth: 200 }} error={!!errors.sectionId}>
                  <InputLabel>Section</InputLabel>
                  <Select
                    {...register("sectionId")}
                    disabled={!selectedEventId || loading}
                    label="Section"
                    sx={{ borderRadius: 2 }}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section.id} value={section.id}>
                        {section.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.sectionId && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.sectionId.message}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  type="number"
                  label="Quantity"
                  slotProps={{ htmlInput: { min: 1, max: 20 } }}
                  {...register("quantity", { valueAsNumber: true })}
                  disabled={loading}
                  placeholder="Enter quantity (1-20)"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              </Box>

              {/* Price and Total */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  type="number"
                  label="Price per Ticket"
                  slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                  {...register("price", { valueAsNumber: true })}
                  disabled={loading}
                  placeholder="Enter price in USD"
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Earnings
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      borderRadius: 2,
                      border: 'none'
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'white'
                      }}
                    >
                      ${totalPrice.toFixed(2)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Seat Numbers and Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  type="text"
                  label="Seat Numbers"
                  placeholder="e.g., A1, A2, A3"
                  {...register("seatNumbers")}
                  disabled={loading}
                  helperText="Enter specific seat numbers if applicable"
                />

                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  type="text"
                  label="Row"
                  placeholder="e.g., Row A"
                  {...register("row")}
                  disabled={loading}
                />
              </Box>

              {/* Notes */}
              <TextField
                {...register("notes")}
                multiline
                rows={4}
                fullWidth
                label="Additional Notes"
                placeholder="Any additional details about your tickets..."
                disabled={loading}
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />

              {/* Ticket Files Upload */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload Ticket Files
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                  component="label"
                >
                  <input
                    id="ticketFiles"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    hidden
                    disabled={loading}
                  />
                  <Stack spacing={2} alignItems="center">
                    <Upload size={48} color="#64748b" />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        Click to upload or drag and drop
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF, PNG, JPG up to 10MB each
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {ticketFiles && ticketFiles.length > 0 && (
                  <Alert 
                    severity="success" 
                    sx={{ borderRadius: 2, mt: 2 }}
                    action={
                      <IconButton
                        size="small"
                        onClick={removeFile}
                        disabled={loading}
                      >
                        <X size={16} />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticketFiles.length} file(s) selected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Array.from(ticketFiles).map((f) => f.name).join(", ")}
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Form Actions */}
              <Box sx={{ pt: 2 }}>
                <Divider sx={{ mb: 3 }} />
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    size="lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedEventId}
                    variant="gradient"
                    size="lg"
                    isLoading={loading}
                  >
                    {loading ? "Creating Listing..." : "Create Listing"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};