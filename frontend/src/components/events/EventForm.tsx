import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  EventSeat as EventSeatIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventFormData,
  EventSectionFormData,
  EventFormProps,
  FormErrors,
  EVENT_TYPES,
  EVENT_STATUSES,
  DEFAULT_EVENT_FORM_DATA,
  DEFAULT_SECTION_FORM_DATA,
} from '../../types/events';
import { useEvents } from '../../contexts/EventContext';
import { LoadingButton } from '@mui/lab';

// Form validation
const validateEventForm = (data: EventFormData): FormErrors => {
  const errors: FormErrors = {};

  // Basic validation
  if (!data.name.trim()) errors.name = 'Event name is required';
  if (data.name.length > 200) errors.name = 'Event name is too long';
  
  if (!data.venue.trim()) errors.venue = 'Venue is required';
  if (!data.address.trim()) errors.address = 'Address is required';
  if (!data.city.trim()) errors.city = 'City is required';
  if (!data.state.trim()) errors.state = 'State is required';
  if (!data.zipCode.trim()) errors.zipCode = 'ZIP code is required';
  
  if (!data.eventDate) errors.eventDate = 'Event date is required';
  if (data.eventDate && new Date(data.eventDate) <= new Date()) {
    errors.eventDate = 'Event date must be in the future';
  }
  
  if (data.doors && data.eventDate && new Date(data.doors) >= new Date(data.eventDate)) {
    errors.doors = 'Doors time must be before event time';
  }
  
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    errors.minPrice = 'Minimum price cannot be greater than maximum price';
  }
  
  if (data.totalSeats && data.availableSeats && data.availableSeats > data.totalSeats) {
    errors.availableSeats = 'Available seats cannot exceed total seats';
  }
  
  if (data.sections.length === 0) {
    errors.sections = 'At least one section is required';
  }
  
  // Section validation
  const sectionNames = data.sections.map(s => s.name.toLowerCase());
  const uniqueNames = new Set(sectionNames);
  if (sectionNames.length !== uniqueNames.size) {
    errors.sections = 'Section names must be unique';
  }
  
  data.sections.forEach((section, index) => {
    if (!section.name.trim()) {
      errors[`section_${index}_name`] = 'Section name is required';
    }
    if (!section.seatCount && !section.rowCount) {
      errors[`section_${index}_capacity`] = 'Section must have either seat count or row count';
    }
  });

  return errors;
};

// Form steps
const FORM_STEPS = [
  { label: 'Basic Information', icon: <InfoIcon /> },
  { label: 'Location', icon: <LocationIcon /> },
  { label: 'Date & Time', icon: <ScheduleIcon /> },
  { label: 'Pricing & Capacity', icon: <MoneyIcon /> },
  { label: 'Sections', icon: <EventSeatIcon /> },
  { label: 'Media & Settings', icon: <ImageIcon /> },
];

const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  mode = 'create',
}) => {
  const { state } = useEvents();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (event) {
      return {
        ...DEFAULT_EVENT_FORM_DATA,
        ...event,
        eventDate: event.eventDate,
        eventTime: event.eventDate.split('T')[1]?.split('.')[0] || '',
        doors: event.doors || '',
        doorsTime: event.doors?.split('T')[1]?.split('.')[0] || '',
        sections: event.sections?.map(section => ({
          ...section,
          isNew: false,
          toDelete: false,
        })) || [],
      };
    }
    return DEFAULT_EVENT_FORM_DATA;
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Memoized validation
  const formErrors = useMemo(() => validateEventForm(formData), [formData]);

  // Handle form field changes
  const handleChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle section changes
  const handleSectionChange = useCallback((index: number, field: keyof EventSectionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));
  }, []);

  // Add new section
  const addSection = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { ...DEFAULT_SECTION_FORM_DATA, isNew: true }],
    }));
  }, []);

  // Remove section
  const removeSection = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const validationErrors = validateEventForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Prepare submission data
      const submissionData: CreateEventRequest | UpdateEventRequest = {
        name: formData.name,
        description: formData.description || undefined,
        venue: formData.venue,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        eventDate: `${formData.eventDate}T${formData.eventTime}:00.000Z`,
        doors: formData.doors && formData.doorsTime ? `${formData.doors}T${formData.doorsTime}:00.000Z` : undefined,
        eventType: formData.eventType,
        category: formData.category || undefined,
        subcategory: formData.subcategory || undefined,
        imageUrl: formData.imageUrl || undefined,
        minPrice: formData.minPrice || undefined,
        maxPrice: formData.maxPrice || undefined,
        totalSeats: formData.totalSeats || undefined,
        availableSeats: formData.availableSeats || undefined,
        ticketmasterId: formData.ticketmasterId || undefined,
        status: formData.status,
        isActive: formData.isActive,
        sections: formData.sections.map(section => ({
          name: section.name,
          description: section.description || undefined,
          rowCount: section.rowCount || undefined,
          seatCount: section.seatCount || undefined,
          priceLevel: section.priceLevel || undefined,
        })),
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [formData, onSubmit]);

  // Step navigation
  const handleNext = useCallback(() => {
    setActiveStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1));
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  }, []);

  const isStepValid = useCallback((step: number) => {
    const stepFields = getStepFields(step);
    return stepFields.every(field => !formErrors[field]);
  }, [formErrors]);

  // Get fields for each step
  const getStepFields = (step: number): (keyof EventFormData)[] => {
    switch (step) {
      case 0:
        return ['name', 'eventType', 'category'];
      case 1:
        return ['venue', 'address', 'city', 'state', 'zipCode'];
      case 2:
        return ['eventDate', 'doors'];
      case 3:
        return ['minPrice', 'maxPrice', 'totalSeats', 'availableSeats'];
      case 4:
        return ['sections'];
      case 5:
        return ['imageUrl'];
      default:
        return [];
    }
  };

  // Render form steps
  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                placeholder="Enter event name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder="Enter event description"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.eventType}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                  label="Event Type"
                  required
                >
                  {EVENT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.eventType && <FormHelperText>{formErrors.eventType}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => handleChange('subcategory', e.target.value)}
                placeholder="Enter subcategory"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Venue"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                error={!!formErrors.venue}
                helperText={formErrors.venue}
                required
                placeholder="Enter venue name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={!!formErrors.address}
                helperText={formErrors.address}
                required
                placeholder="Enter street address"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                error={!!formErrors.city}
                helperText={formErrors.city}
                required
                placeholder="Enter city"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                error={!!formErrors.state}
                helperText={formErrors.state}
                required
                placeholder="Enter state"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                error={!!formErrors.zipCode}
                helperText={formErrors.zipCode}
                required
                placeholder="Enter ZIP code"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Event Date & Time"
                  value={formData.eventDate ? new Date(formData.eventDate) : null}
                  onChange={(date) => handleChange('eventDate', date?.toISOString().split('T')[0])}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!formErrors.eventDate}
                      helperText={formErrors.eventDate}
                      required
                    />
                  )}
                  minDateTime={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Event Time"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => handleChange('eventTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Doors Open (Optional)"
                  value={formData.doors ? new Date(formData.doors) : null}
                  onChange={(date) => handleChange('doors', date?.toISOString().split('T')[0])}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!formErrors.doors}
                      helperText={formErrors.doors}
                    />
                  )}
                  minDateTime={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doors Time"
                  type="time"
                  value={formData.doorsTime}
                  onChange={(e) => handleChange('doorsTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Price"
                type="number"
                value={formData.minPrice}
                onChange={(e) => handleChange('minPrice', parseFloat(e.target.value) || '')}
                error={!!formErrors.minPrice}
                helperText={formErrors.minPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Price"
                type="number"
                value={formData.maxPrice}
                onChange={(e) => handleChange('maxPrice', parseFloat(e.target.value) || '')}
                error={!!formErrors.maxPrice}
                helperText={formErrors.maxPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Seats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) => handleChange('totalSeats', parseInt(e.target.value) || '')}
                error={!!formErrors.totalSeats}
                helperText={formErrors.totalSeats}
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Available Seats"
                type="number"
                value={formData.availableSeats}
                onChange={(e) => handleChange('availableSeats', parseInt(e.target.value) || '')}
                error={!!formErrors.availableSeats}
                helperText={formErrors.availableSeats}
                placeholder="0"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Event Sections</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSection}
                disabled={formData.sections.length >= 50}
              >
                Add Section
              </Button>
            </Box>
            
            {formErrors.sections && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.sections}
              </Alert>
            )}

            {formData.sections.map((section, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EventSeatIcon />
                    <Typography>
                      {section.name || `Section ${index + 1}`}
                    </Typography>
                    {section.seatCount && (
                      <Chip
                        label={`${section.seatCount} seats`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Section Name"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                        error={!!formErrors[`section_${index}_name`]}
                        helperText={formErrors[`section_${index}_name`]}
                        required
                        placeholder="Enter section name"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={section.description}
                        onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                        placeholder="Enter section description"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Row Count"
                        type="number"
                        value={section.rowCount}
                        onChange={(e) => handleSectionChange(index, 'rowCount', parseInt(e.target.value) || '')}
                        placeholder="0"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Seat Count"
                        type="number"
                        value={section.seatCount}
                        onChange={(e) => handleSectionChange(index, 'seatCount', parseInt(e.target.value) || '')}
                        error={!!formErrors[`section_${index}_capacity`]}
                        helperText={formErrors[`section_${index}_capacity`]}
                        placeholder="0"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Price Level"
                        type="number"
                        value={section.priceLevel}
                        onChange={(e) => handleSectionChange(index, 'priceLevel', parseInt(e.target.value) || '')}
                        placeholder="1"
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton
                          color="error"
                          onClick={() => removeSection(index)}
                          disabled={formData.sections.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="Enter image URL"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ticketmaster ID"
                value={formData.ticketmasterId}
                onChange={(e) => handleChange('ticketmasterId', e.target.value)}
                placeholder="Enter Ticketmaster ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
                >
                  {EVENT_STATUSES.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{ bgcolor: `${status.color}.main`, color: 'white' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h4" gutterBottom>
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'create' 
              ? 'Create a new event with all the necessary details'
              : 'Update event information and settings'
            }
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {FORM_STEPS.map((step, index) => (
            <Step key={step.label} completed={index < activeStep || (index === activeStep && isStepValid(index))}>
              <StepLabel icon={step.icon}>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Box mt={2} mb={3}>
                  {renderStep(index)}
                </Box>
                <Box display="flex" gap={2}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  {index === FORM_STEPS.length - 1 ? (
                    <LoadingButton
                      loading={loading}
                      onClick={handleSubmit}
                      variant="contained"
                      startIcon={<SaveIcon />}
                      loadingPosition="start"
                    >
                      {mode === 'create' ? 'Create Event' : 'Update Event'}
                    </LoadingButton>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(index)}
                    >
                      Next
                    </Button>
                  )}
                  <Button
                    onClick={onCancel}
                    variant="text"
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default EventForm;