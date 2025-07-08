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
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { SweetAlert } from '../../utils/sweetAlert';
import type { Event } from '../../types/event';

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
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const dashboardData = await response.json();
        const eventData = dashboardData.data.events;
        const transactionData = dashboardData.data.transactions;
        
        const statsData: EventStats = {
          totalEvents: eventData.total || 0,
          upcomingEvents: eventData.upcoming || 0,
          activeEvents: eventData.active || 0,
          completedEvents: Math.max(0, eventData.total - eventData.upcoming - eventData.active) || 0,
          totalRevenue: transactionData.revenue || 0,
          averageTicketPrice: transactionData.total > 0 ? transactionData.volume / transactionData.total : 0,
          totalAttendees: transactionData.completed || 0, // Assuming completed transactions = attendees
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    const confirmed = await SweetAlert.confirm(
      'Delete Event?',
      'This action cannot be undone. All associated data will be permanently deleted.'
    );

    if (confirmed) {
      try {
        // Mock delete - in real app, this would be an API call
        setEvents(prev => prev.filter(event => event.id !== eventId));
        SweetAlert.success('Event deleted', 'The event has been successfully deleted');
      } catch (error) {
        SweetAlert.error('Failed to delete event', 'Please try again');
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
                  {event.venue?.name || 'TBA'}, {event.venue?.city || 'TBA'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.venue?.capacity || 0} capacity
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
                        <div className="font-medium">{selectedEvent.venue?.name || 'TBA'}</div>
                        <div className="text-sm text-gray-600">
                          {selectedEvent.venue?.address || 'TBA'}<br />
                          {selectedEvent.venue?.city || 'TBA'}, {selectedEvent.venue?.state || ''} {selectedEvent.venue?.zipCode || ''}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Capacity: {selectedEvent.venue?.capacity || 0}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Sections & Pricing</h4>
                      <div className="space-y-2">
                        {selectedEvent.sections.map((section: any) => (
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
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Event creation form would go here</p>
                <p className="text-sm mt-2">This would include fields for event details, venue, sections, pricing, etc.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};