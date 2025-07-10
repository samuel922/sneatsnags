import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, MapPin, DollarSign, Clock, Ticket, Heart, Grid, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { eventService } from '../services/eventService';
import { listingService } from '../services/listingService';
import type { Event, Listing } from '../types';

export const BrowseTicketsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, searchTerm, selectedEvent, priceRange, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API, but handle failures gracefully
      let eventsData: Event[] = [];
      let listingsData: Listing[] = [];
      
      try {
        const eventsResponse = await eventService.getEventsSilent();
        eventsData = eventsResponse.data || [];
      } catch (eventsError) {
        console.warn('Events API not available:', eventsError);
        // Events API failed - this is expected if backend isn't ready
      }
      
      try {
        const listingsResponse = await listingService.getListingsSilent({ status: 'ACTIVE' });
        listingsData = listingsResponse.data || [];
      } catch (listingsError) {
        console.warn('Listings API not available:', listingsError);
        // Listings API failed - this is expected if backend isn't ready
      }
      
      setEvents(eventsData);
      setListings(listingsData);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set empty arrays on any error
      setEvents([]);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = listings.filter(listing => {
      if (searchTerm && !listing.event.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedEvent && listing.event.id !== selectedEvent) {
        return false;
      }
      if (priceRange.min && listing.pricePerTicket < parseFloat(priceRange.min)) {
        return false;
      }
      if (priceRange.max && listing.pricePerTicket > parseFloat(priceRange.max)) {
        return false;
      }
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priceAsc':
          return a.pricePerTicket - b.pricePerTicket;
        case 'priceDesc':
          return b.pricePerTicket - a.pricePerTicket;
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
  };

  const handleEventFilter = (eventId: string) => {
    setSelectedEvent(eventId);
    setCurrentPage(1);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (eventId) {
        newParams.set('event', eventId);
      } else {
        newParams.delete('event');
      }
      return newParams;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Browse Tickets
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find tickets to your favorite events from verified sellers
          </p>
        </div>

        {/* Search and Filters */}
        <Card variant="glass" className="mb-8 backdrop-blur-xl border-white/30">
          <CardContent className="p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Input
                  placeholder="Search events, artists, venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="glass"
                  icon={<Search className="h-5 w-5" />}
                  className="text-lg"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Event Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => handleEventFilter(e.target.value)}
                    className="w-full px-4 py-2 glass rounded-xl border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Events</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    variant="glass"
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <Input
                    type="number"
                    placeholder="$1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    variant="glass"
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 glass rounded-xl border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button type="submit" variant="gradient" className="px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Search Tickets
                </Button>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} variant="glass" className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-2xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all events.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Grid */}
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredListings.map((listing) => (
                <Card key={listing.id} variant="glass" className="group hover:shadow-2xl transition-all duration-300">
                  {listing.event.imageUrl && (
                    <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                      <img
                        src={listing.event.imageUrl}
                        alt={listing.event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="sm" className="bg-white/20 backdrop-blur-sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {listing.event.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(listing.event.date)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {listing.event.venue}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">
                            {listing.section?.name} - Row {listing.row}, Seats {listing.seatNumbers}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.quantity} {listing.quantity === 1 ? 'ticket' : 'tickets'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(listing.pricePerTicket)}
                          </div>
                          <div className="text-sm text-gray-500">per ticket</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Listed {new Date(listing.createdAt).toLocaleDateString()}
                        </div>
                        <Button variant="primary" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Results Info */}
            <div className="text-center text-gray-600 mt-8">
              <p>Showing {filteredListings.length} of {listings.length} available tickets</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};