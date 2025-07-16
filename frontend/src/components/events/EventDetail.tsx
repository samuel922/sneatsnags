import React, { useState, useEffect, useMemo } from 'react';
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Skeleton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  Stack,
  Breadcrumbs,
  Link,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Info as InfoIcon,
  EventSeat as EventSeatIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays, formatDistanceToNow } from 'date-fns';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import {
  Event,
  EventSection,
} from '../../types/events';
import { useEvents, useEventAdmin, useEventStats } from '../../contexts/EventContext';
import { LoadingButton } from '@mui/lab';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Statistics Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}> = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Event Sections Table Component
const EventSectionsTable: React.FC<{ sections: EventSection[] }> = ({ sections }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Section Name</TableCell>
          <TableCell>Description</TableCell>
          <TableCell align="right">Rows</TableCell>
          <TableCell align="right">Seats</TableCell>
          <TableCell align="right">Price Level</TableCell>
          <TableCell align="right">Capacity</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sections.map((section) => (
          <TableRow key={section.id} hover>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <EventSeatIcon fontSize="small" />
                <Typography fontWeight={600}>{section.name}</Typography>
              </Box>
            </TableCell>
            <TableCell>{section.description || '—'}</TableCell>
            <TableCell align="right">{section.rowCount || '—'}</TableCell>
            <TableCell align="right">{section.seatCount || '—'}</TableCell>
            <TableCell align="right">
              {section.priceLevel ? (
                <Chip
                  label={`Level ${section.priceLevel}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell align="right">
              <Typography fontWeight={600}>{section.capacity}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Main Event Detail Component
const EventDetail: React.FC<EventDetailProps> = ({
  eventId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { state, actions } = useEvents();
  const { isAdmin } = useEventAdmin();
  const { stats, loading: statsLoading } = useEventStats(eventId);
  const [currentTab, setCurrentTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const event = state.currentEvent;
  const loading = state.loading;
  const error = state.error;

  useEffect(() => {
    if (eventId) {
      actions.loadEvent(eventId, true);
    }
  }, [eventId, actions]);

  const eventStats = useMemo(() => {
    if (!stats) return null;
    return {
      totalOffers: stats.totalOffers || 0,
      totalListings: stats.totalListings || 0,
      totalTransactions: stats.totalTransactions || 0,
      averageOfferPrice: stats.averageOfferPrice || 0,
      averageListingPrice: stats.averageListingPrice || 0,
      popularityScore: stats.popularityScore || 0,
      bookingRate: stats.bookingRate || 0,
    };
  }, [stats]);

  const handleDelete = async () => {
    if (!event) return;
    
    setDeleting(true);
    try {
      await onDelete(event.id);
      setDeleteDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: event?.name,
        text: `Check out this event: ${event?.name}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setShareDialogOpen(true);
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
    const icons: Record<string, string> = {
      SPORTS: '⚽',
      CONCERT: '🎵',
      THEATER: '🎭',
      COMEDY: '😂',
      OTHER: '🎪',
    };
    return icons[type] || '🎪';
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!eventStats) return null;

    return {
      activityChart: {
        labels: ['Offers', 'Listings', 'Transactions'],
        datasets: [
          {
            label: 'Activity',
            data: [eventStats.totalOffers, eventStats.totalListings, eventStats.totalTransactions],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            borderWidth: 1,
          },
        ],
      },
      priceChart: {
        labels: ['Average Offer Price', 'Average Listing Price'],
        datasets: [
          {
            label: 'Price ($)',
            data: [eventStats.averageOfferPrice, eventStats.averageListingPrice],
            backgroundColor: ['#4BC0C0', '#9966FF'],
            borderColor: ['#4BC0C0', '#9966FF'],
            borderWidth: 2,
          },
        ],
      },
    };
  }, [eventStats]);

  if (loading && !event) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Alert severity="error" action={
        <Button onClick={onBack}>Go Back</Button>
      }>
        {error || 'Event not found'}
      </Alert>
    );
  }

  const isUpcoming = differenceInDays(parseISO(event.eventDate), new Date()) >= 0;
  const timeUntilEvent = formatDistanceToNow(parseISO(event.eventDate), { addSuffix: true });

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={onBack}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Events
        </Link>
        <Typography color="text.primary">{event.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            {event.name}
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip
              label={event.status}
              color={getStatusColor(event.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${getEventTypeIcon(event.eventType)} ${event.eventType}`}
              variant="outlined"
            />
            {event.category && (
              <Chip label={event.category} variant="outlined" size="small" />
            )}
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Share Event">
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit(event)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            Back
          </Button>
        </Box>
      </Box>

      {/* Hero Image and Quick Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height={400}
              image={event.imageUrl || `https://via.placeholder.com/800x400?text=${encodeURIComponent(event.name)}`}
              alt={event.name}
              sx={{
                objectFit: 'cover',
                background: !event.imageUrl ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' : undefined,
              }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><ScheduleIcon /></ListItemIcon>
                  <ListItemText
                    primary="Date & Time"
                    secondary={`${format(parseISO(event.eventDate), 'EEEE, MMMM dd, yyyy')} at ${format(parseISO(event.eventDate), 'h:mm a')}`}
                  />
                </ListItem>
                
                {event.doors && (
                  <ListItem>
                    <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                    <ListItemText
                      primary="Doors Open"
                      secondary={format(parseISO(event.doors), 'h:mm a')}
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemIcon><LocationIcon /></ListItemIcon>
                  <ListItemText
                    primary="Venue"
                    secondary={
                      <Box>
                        <Typography variant="body2">{event.venue}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {event.address}, {event.city}, {event.state} {event.zipCode}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                
                {(event.minPrice > 0 || event.maxPrice > 0) && (
                  <ListItem>
                    <ListItemIcon><MoneyIcon /></ListItemIcon>
                    <ListItemText
                      primary="Price Range"
                      secondary={
                        event.minPrice === event.maxPrice
                          ? `$${event.minPrice}`
                          : `$${event.minPrice} - $${event.maxPrice}`
                      }
                    />
                  </ListItem>
                )}
                
                {event.totalSeats > 0 && (
                  <ListItem>
                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                    <ListItemText
                      primary="Capacity"
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {event.availableSeats} / {event.totalSeats} available
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(event.availableSeats / event.totalSeats) * 100}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
              
              {isUpcoming && (
                <Box mt={2} p={2} bgcolor="primary.light" borderRadius={1}>
                  <Typography variant="body2" color="primary.contrastText">
                    <strong>{timeUntilEvent}</strong>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Overview */}
      {eventStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Offers"
              value={eventStats.totalOffers}
              icon={<TrendingUpIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Listings"
              value={eventStats.totalListings}
              icon={<EventSeatIcon />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Transactions"
              value={eventStats.totalTransactions}
              icon={<AssessmentIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Popularity Score"
              value={`${eventStats.popularityScore.toFixed(1)}%`}
              icon={<StarIcon />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Overview" icon={<InfoIcon />} />
            <Tab label="Sections" icon={<EventSeatIcon />} />
            {eventStats && <Tab label="Analytics" icon={<AssessmentIcon />} />}
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {event.description || 'No description available for this event.'}
              </Typography>
              
              {event.ticketmasterId && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    External Links
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    href={`https://www.ticketmaster.com/event/${event.ticketmasterId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Ticketmaster
                  </Button>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {format(parseISO(event.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {format(parseISO(event.updatedAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                
                {event.subcategory && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Subcategory
                    </Typography>
                    <Typography variant="body2">{event.subcategory}</Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Box display="flex" gap={1} mt={0.5}>
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                      size="small"
                    />
                    <Chip
                      label={event.isActive ? 'Active' : 'Inactive'}
                      color={event.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Event Sections ({event.sections?.length || 0})
          </Typography>
          {event.sections && event.sections.length > 0 ? (
            <EventSectionsTable sections={event.sections} />
          ) : (
            <Alert severity="info">
              No sections defined for this event.
            </Alert>
          )}
        </TabPanel>

        {eventStats && (
          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Event Analytics
            </Typography>
            
            {statsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <Typography>Loading analytics...</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Activity Overview
                      </Typography>
                      {chartData?.activityChart && (
                        <Box height={300}>
                          <Doughnut
                            data={chartData.activityChart}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Average Prices
                      </Typography>
                      {chartData?.priceChart && (
                        <Box height={300}>
                          <Bar
                            data={chartData.priceChart}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: (value) => `$${value}`,
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Key Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="primary">
                              ${eventStats.averageOfferPrice.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Average Offer Price
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="secondary">
                              ${eventStats.averageListingPrice.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Average Listing Price
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="success.main">
                              {eventStats.bookingRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Booking Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="warning.main">
                              {eventStats.popularityScore.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Popularity Score
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{event.name}"? This action cannot be undone and will remove all associated data.
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
            Delete Event
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Event</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Event link copied to clipboard!
          </Typography>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <ContentCopyIcon />
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetail;