import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Plus } from 'lucide-react';
import { eventService } from '../services/eventService';
import type { Event } from '../types/event';
import { EventCategory } from '../types/event';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedCategory]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        page: currentPage,
        limit: 12,
        category: selectedCategory || undefined,
      });
      
      // Handle different possible response structures
      const eventsData = response.data?.items || response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await eventService.searchEvents(searchQuery, {
        page: 1,
        limit: 12,
      });
      
      // Handle different possible response structures
      const eventsData = response.data?.items || response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleMakeOffer = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault(); // Prevent the Link navigation
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== UserRole.BUYER) {
      alert('Only buyers can make offers');
      return;
    }
    
    navigate(`/events/${eventId}/offer`);
  };

  if (loading && events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Events</h1>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search events, venues, or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EventCategory | '')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option value={EventCategory.CONCERT}>Concerts</option>
              <option value={EventCategory.SPORTS}>Sports</option>
              <option value={EventCategory.THEATER}>Theater</option>
              <option value={EventCategory.COMEDY}>Comedy</option>
              <option value={EventCategory.OTHER}>Other</option>
            </select>
            
            <Button type="submit" className="px-6">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events && events.length > 0 && events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="relative">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {event.category}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                {event.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{event.venue}, {event.city}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">From </span>
                  <span className="font-bold text-primary-600">
                    {formatPrice(event.minPrice)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {event.ticketsAvailable} available
                </div>
              </div>
              
              {/* Make Offer Button */}
              {user && user.role === UserRole.BUYER && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => handleMakeOffer(e, event.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Make Offer
                  </Button>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
        </div>
      )}
    </div>
  );
};