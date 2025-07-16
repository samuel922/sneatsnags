import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Event, CreateEventRequest, UpdateEventRequest } from '../../types/events';
import { useEvents, useEventAdmin } from '../../contexts/EventContext';
import { EventProvider } from '../../contexts/EventContext';
import EventList from '../../components/events/EventList';
import EventForm from '../../components/events/EventForm';
import EventDetail from '../../components/events/EventDetail';
import { handleEventServiceError } from '../../services/eventService';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

interface EventManagementState {
  viewMode: ViewMode;
  selectedEvent: Event | null;
  formDialogOpen: boolean;
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

const EventManagementContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state, actions } = useEvents();
  const { isAdmin } = useEventAdmin();
  
  const [managementState, setManagementState] = useState<EventManagementState>({
    viewMode: 'list',
    selectedEvent: null,
    formDialogOpen: false,
    notification: {
      open: false,
      message: '',
      severity: 'success',
    },
  });

  // Show notification
  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setManagementState(prev => ({
      ...prev,
      notification: { open: true, message, severity },
    }));
  }, []);

  // Close notification
  const closeNotification = useCallback(() => {
    setManagementState(prev => ({
      ...prev,
      notification: { ...prev.notification, open: false },
    }));
  }, []);

  // Handle view changes
  const handleViewChange = useCallback((viewMode: ViewMode, event?: Event) => {
    setManagementState(prev => ({
      ...prev,
      viewMode,
      selectedEvent: event || null,
      formDialogOpen: viewMode === 'create' || viewMode === 'edit',
    }));
  }, []);

  // Handle event selection
  const handleEventSelect = useCallback((event: Event) => {
    handleViewChange('detail', event);
  }, [handleViewChange]);

  // Handle event creation
  const handleEventCreate = useCallback(() => {
    if (!isAdmin) {
      showNotification('You need admin privileges to create events', 'error');
      return;
    }
    handleViewChange('create');
  }, [isAdmin, handleViewChange, showNotification]);

  // Handle event edit
  const handleEventEdit = useCallback((event: Event) => {
    if (!isAdmin) {
      showNotification('You need admin privileges to edit events', 'error');
      return;
    }
    handleViewChange('edit', event);
  }, [isAdmin, handleViewChange, showNotification]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: CreateEventRequest | UpdateEventRequest) => {
    try {
      if (managementState.viewMode === 'create') {
        const newEvent = await actions.createEvent(data as CreateEventRequest);
        showNotification(`Event "${newEvent.name}" created successfully!`, 'success');
        handleViewChange('detail', newEvent);
      } else if (managementState.viewMode === 'edit' && managementState.selectedEvent) {
        const updatedEvent = await actions.updateEvent(managementState.selectedEvent.id, data as UpdateEventRequest);
        showNotification(`Event "${updatedEvent.name}" updated successfully!`, 'success');
        handleViewChange('detail', updatedEvent);
      }
    } catch (error) {
      const errorMessage = handleEventServiceError(error, 'Failed to save event');
      showNotification(errorMessage, 'error');
    }
  }, [managementState.viewMode, managementState.selectedEvent, actions, showNotification, handleViewChange]);

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    if (managementState.selectedEvent && managementState.viewMode === 'edit') {
      handleViewChange('detail', managementState.selectedEvent);
    } else {
      handleViewChange('list');
    }
  }, [managementState.selectedEvent, managementState.viewMode, handleViewChange]);

  // Handle event deletion
  const handleEventDelete = useCallback(async (eventId: string) => {
    if (!isAdmin) {
      showNotification('You need admin privileges to delete events', 'error');
      return;
    }

    try {
      await actions.deleteEvent(eventId);
      showNotification('Event deleted successfully!', 'success');
      handleViewChange('list');
    } catch (error) {
      const errorMessage = handleEventServiceError(error, 'Failed to delete event');
      showNotification(errorMessage, 'error');
    }
  }, [isAdmin, actions, showNotification, handleViewChange]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    handleViewChange('list');
  }, [handleViewChange]);

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    const breadcrumbs = [
      <Link
        key="home"
        component="button"
        variant="body1"
        onClick={() => handleViewChange('list')}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <HomeIcon fontSize="small" />
        Admin
      </Link>,
      <Link
        key="events"
        component="button"
        variant="body1"
        onClick={() => handleViewChange('list')}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <EventIcon fontSize="small" />
        Events
      </Link>
    ];

    if (managementState.viewMode === 'detail' && managementState.selectedEvent) {
      breadcrumbs.push(
        <Typography key="detail" color="text.primary">
          {managementState.selectedEvent.name}
        </Typography>
      );
    } else if (managementState.viewMode === 'create') {
      breadcrumbs.push(
        <Typography key="create" color="text.primary">
          Create Event
        </Typography>
      );
    } else if (managementState.viewMode === 'edit' && managementState.selectedEvent) {
      breadcrumbs.push(
        <Typography key="edit" color="text.primary">
          Edit {managementState.selectedEvent.name}
        </Typography>
      );
    }

    return <Breadcrumbs sx={{ mb: 3 }}>{breadcrumbs}</Breadcrumbs>;
  };

  // Render main content based on view mode
  const renderContent = () => {
    switch (managementState.viewMode) {
      case 'list':
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Event Management
              </Typography>
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleEventCreate}
                  size="large"
                >
                  Create Event
                </Button>
              )}
            </Box>
            
            {!isAdmin && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You are viewing events in read-only mode. Admin privileges are required to create, edit, or delete events.
              </Alert>
            )}

            <EventList
              events={state.events}
              loading={state.loading}
              error={state.error}
              onEventSelect={handleEventSelect}
              onEventEdit={handleEventEdit}
              onEventDelete={handleEventDelete}
            />
          </Box>
        );

      case 'detail':
        return managementState.selectedEvent ? (
          <EventDetail
            eventId={managementState.selectedEvent.id}
            onBack={handleBack}
            onEdit={handleEventEdit}
            onDelete={handleEventDelete}
          />
        ) : (
          <Alert severity="error">Event not found</Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {renderBreadcrumbs()}
      
      {/* Main Content */}
      {renderContent()}

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={managementState.formDialogOpen}
        onClose={handleFormCancel}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          {managementState.viewMode === 'create' ? 'Create New Event' : 'Edit Event'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <EventForm
            event={managementState.selectedEvent}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={state.loading}
            error={state.error}
            mode={managementState.viewMode === 'create' ? 'create' : 'edit'}
          />
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && isAdmin && managementState.viewMode === 'list' && (
        <Fab
          color="primary"
          aria-label="create event"
          onClick={handleEventCreate}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={managementState.notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeNotification}
          severity={managementState.notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {managementState.notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Main Event Management Page with Provider
const EventManagementPage: React.FC = () => {
  return (
    <EventProvider>
      <EventManagementContent />
    </EventProvider>
  );
};

export default EventManagementPage;