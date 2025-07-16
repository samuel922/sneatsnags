import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Skeleton,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  EventFilters,
  EventListProps,
  EventCardProps,
  EVENT_TYPES,
  EVENT_STATUSES,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
} from '../../types/events';
import { useEvents, useEventAdmin } from '../../contexts/EventContext';
import { LoadingButton } from '@mui/lab';

// Event Card Component
const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(event.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'POSTPONED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEventTypeIcon = (type: string) => {
    const eventType = EVENT_TYPES.find(t => t.value === type);
    return eventType?.icon || '🎪';
  };

  const isUpcoming = differenceInDays(parseISO(event.eventDate), new Date()) >= 0;
  const daysUntil = differenceInDays(parseISO(event.eventDate), new Date());

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          },
        }}
        onClick={() => onSelect(event)}
      >
        <CardMedia
          sx={{
            height: 200,
            background: event.imageUrl
              ? `url(${event.imageUrl})`
              : 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              gap: 1,
            }}
          >
            <Chip
              label={event.status}
              size="small"
              color={getStatusColor(event.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
              sx={{ fontWeight: 600 }}
            />
            {isUpcoming && daysUntil <= 7 && (
              <Chip
                label={daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                size="small"
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          
          {showActions && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <IconButton
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                }}
                onClick={handleMenuClick}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography variant="caption" color="white" fontWeight={600}>
              {getEventTypeIcon(event.eventType)} {event.eventType}
            </Typography>
          </Box>
        </CardMedia>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {event.name}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {event.venue}, {event.city}, {event.state}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {format(parseISO(event.eventDate), 'MMM dd, yyyy • h:mm a')}
            </Typography>
          </Box>

          {(event.minPrice > 0 || event.maxPrice > 0) && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <MoneyIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.minPrice === event.maxPrice
                  ? `$${event.minPrice}`
                  : `$${event.minPrice} - $${event.maxPrice}`}
              </Typography>
            </Box>
          )}

          {event.totalSeats > 0 && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.availableSeats} / {event.totalSeats} available
              </Typography>
            </Box>
          )}

          {event.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 2,
              }}
            >
              {event.description}
            </Typography>
          )}

          <Box display="flex" gap={1} flexWrap="wrap">
            {event.category && (
              <Chip label={event.category} size="small" variant="outlined" />
            )}
            {event.subcategory && (
              <Chip label={event.subcategory} size="small" variant="outlined" />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { onSelect(event); handleMenuClose(); }}>
          <ListItemIcon><ViewIcon /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEdit(event); handleMenuClose(); }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Edit Event</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
          <ListItemText>Delete Event</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{event.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleDelete}
            loading={deleting}
            color="error"
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Event Filters Component
const EventFilters: React.FC<{
  filters: EventFilters;
  onFiltersChange: (filters: Partial<EventFilters>) => void;
  onReset: () => void;
}> = ({ filters, onFiltersChange, onReset }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'search') return false; // Search is handled separately
      return value !== '' && value !== null && value !== undefined;
    });
  }, [filters]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" mb={filtersOpen ? 2 : 0}>
            <TextField
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            
            <Button
              variant={hasActiveFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v !== '' && v !== null).length - 1})`}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={onReset}
              >
                Clear
              </Button>
            )}
          </Box>

          {filtersOpen && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="City"
                  value={filters.city}
                  onChange={(e) => onFiltersChange({ city: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={filters.state}
                  onChange={(e) => onFiltersChange({ state: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={filters.eventType}
                    onChange={(e) => onFiltersChange({ eventType: e.target.value as EventFilters['eventType'] })}
                    label="Event Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {EVENT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => onFiltersChange({ status: e.target.value as EventFilters['status'] })}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
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
              
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="From Date"
                  value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                  onChange={(date) => onFiltersChange({ dateFrom: date?.toISOString().split('T')[0] || '' })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="To Date"
                  value={filters.dateTo ? new Date(filters.dateTo) : null}
                  onChange={(date) => onFiltersChange({ dateTo: date?.toISOString().split('T')[0] || '' })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => onFiltersChange({ minPrice: parseFloat(e.target.value) || '' })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => onFiltersChange({ maxPrice: parseFloat(e.target.value) || '' })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

// Main Event List Component
const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  error,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  onLoadMore,
  hasMore,
}) => {
  const { state, actions } = useEvents();
  const { isAdmin } = useEventAdmin();
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSortMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    actions.setSorting(sortBy, sortOrder);
    handleSortMenuClose();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    actions.loadEvents({ page });
  };

  const handleRefresh = () => {
    actions.loadEvents();
  };

  // Loading skeleton
  if (loading && events.length === 0) {
    return (
      <Box>
        <EventFilters
          filters={state.filters}
          onFiltersChange={actions.setFilters}
          onReset={() => actions.setFilters(DEFAULT_FILTERS)}
        />
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                  <Box display="flex" gap={1} mt={2}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <EventFilters
        filters={state.filters}
        onFiltersChange={actions.setFilters}
        onReset={() => actions.setFilters(DEFAULT_FILTERS)}
      />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {state.pagination.total > 0 
              ? `Showing ${((state.pagination.page - 1) * state.pagination.limit) + 1}-${Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} of ${state.pagination.total} events`
              : 'No events found'
            }
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleSortMenuClick}
          >
            Sort: {SORT_OPTIONS.find(opt => opt.value === state.sortBy)?.label}
            {state.sortOrder === 'desc' ? ' ↓' : ' ↑'}
          </Button>
        </Box>
      </Box>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
      >
        {SORT_OPTIONS.map(option => (
          <React.Fragment key={option.value}>
            <MenuItem onClick={() => handleSortChange(option.value, 'asc')}>
              {option.label} (A-Z / Low-High)
            </MenuItem>
            <MenuItem onClick={() => handleSortChange(option.value, 'desc')}>
              {option.label} (Z-A / High-Low)
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Events Grid */}
      {events.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                <EventCard
                  event={event}
                  onSelect={onEventSelect}
                  onEdit={onEventEdit}
                  onDelete={onEventDelete}
                  showActions={isAdmin}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {state.pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={state.pagination.totalPages}
                page={state.pagination.page}
                onChange={handlePageChange}
                disabled={loading}
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Load More Button (alternative to pagination) */}
          {onLoadMore && hasMore && (
            <Box display="flex" justifyContent="center" mt={4}>
              <LoadingButton
                loading={loading}
                onClick={onLoadMore}
                variant="outlined"
                size="large"
              >
                Load More Events
              </LoadingButton>
            </Box>
          )}
        </>
      ) : !loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
        >
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.200', mb: 2 }}>
            <EventIcon sx={{ fontSize: 32, color: 'grey.500' }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            {Object.values(state.filters).some(v => v !== '' && v !== null)
              ? 'Try adjusting your filters to find more events.'
              : 'There are no events available at the moment.'
            }
          </Typography>
          {Object.values(state.filters).some(v => v !== '' && v !== null) && (
            <Button
              variant="outlined"
              onClick={() => actions.setFilters(DEFAULT_FILTERS)}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      )}

      {/* Loading overlay for subsequent loads */}
      {loading && events.length > 0 && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(255, 255, 255, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Typography>Loading events...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default EventList;