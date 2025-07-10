import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Calendar, MapPin, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { offerService } from '../services/offerService';
import { eventService } from '../services/eventService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import type { Offer } from '../types/offer';
import type { Event } from '../types/event';

export const BrowseOffersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOffers();
    fetchEvents();
  }, [searchTerm, selectedEvent, priceRange, statusFilter, sortBy, currentPage]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        eventId: selectedEvent || undefined,
        minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
        maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
        status: statusFilter as 'ACTIVE' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED',
        sortBy: sortBy as 'newest' | 'oldest' | 'priceAsc' | 'priceDesc',
      };

      // Use getOffers instead of searchOffers when no search term
      const response = searchTerm 
        ? await offerService.searchOffers(searchTerm, params)
        : await offerService.getOffers(params);
      setOffers(response.offers);
      setTotalPages(Math.ceil(response.total / 12));
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents({ limit: 50 });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'ACCEPTED':
        return 'text-blue-600 bg-blue-100';
      case 'EXPIRED':
        return 'text-gray-600 bg-gray-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <TrendingUp className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'EXPIRED':
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Browse Offers
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            View active offers from buyers looking for tickets to their favorite events
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 glass rounded-xl border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active Offers</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CANCELLED">Cancelled</option>
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
                    <option value="priceDesc">Highest Price</option>
                    <option value="priceAsc">Lowest Price</option>
                  </select>
                </div>
              </div>

              <Button type="submit" variant="gradient" className="px-8">
                <Search className="h-4 w-4 mr-2" />
                Search Offers
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} variant="glass" className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all events.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {offers.map((offer) => (
                <Link key={offer.id} to={`/offers/${offer.id}`}>
                  <Card variant="glass" className="group hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1 capitalize">{offer.status.toLowerCase()}</span>
                        </span>
                        {offer.status === 'ACTIVE' && (
                          <span className="text-xs text-gray-500">
                            {getTimeRemaining(offer.expiresAt)}
                          </span>
                        )}
                      </div>

                      {/* Event Info */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {offer.event?.name || 'Event Name'}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {offer.event?.date ? formatDate(offer.event.date) : 'TBD'}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {offer.event?.venue || 'Venue TBD'}
                          </div>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="bg-blue-50/50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Looking for:</span>
                          <span className="font-medium">
                            {offer.quantity} {offer.quantity === 1 ? 'ticket' : 'tickets'}
                          </span>
                        </div>
                        
                        {offer.sections && offer.sections.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Section:</span>
                            <span className="font-medium">{offer.sections[0].section?.name || 'Any Section'}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-blue-200/50">
                          <span className="text-sm text-gray-600">Offering:</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(offer.maxPrice)}
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          per ticket
                        </div>
                      </div>

                      {/* Buyer Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white font-semibold text-xs">
                              {offer.buyer?.firstName?.[0] || 'U'}{offer.buyer?.lastName?.[0] || 'N'}
                            </span>
                          </div>
                          <span>{offer.buyer?.firstName || 'Unknown'} {offer.buyer?.lastName || 'Buyer'}</span>
                        </div>
                      </div>

                      {/* Message Preview */}
                      {offer.message && (
                        <div className="bg-gray-50/50 rounded-xl p-3">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            "{offer.message}"
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                          View Details →
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'primary' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};