import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Share2, 
  Heart,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { eventService } from '../services/eventService';
import type { Event, EventSection } from '../types/events';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [sections, setSections] = useState<EventSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Event ID is required');
      }

      const [eventData, sectionsData] = await Promise.all([
        eventService.getEvent(id),
        eventService.getEventSections(id).catch(() => []) // Gracefully handle missing sections
      ]);

      setEvent(eventData);
      setSections(sectionsData);
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleMakeOffer = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== UserRole.BUYER) {
      alert('Only buyers can make offers');
      return;
    }
    
    navigate(`/events/${id}/offer`);
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out this event: ${event.name}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Image */}
          <div className="relative mb-6">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-24 w-24 text-white" />
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <p className="text-lg text-gray-600">{event.description}</p>
            </div>

            {/* Event Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Event Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>{formatTime(event.time || event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{event.venue}, {event.city}, {event.state}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>{event.totalCapacity.toLocaleString()} total capacity</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price Range:</span>
                    <span className="font-semibold">
                      {formatPrice(event.minPrice)} - {formatPrice(event.maxPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tickets Available:</span>
                    <span className="font-semibold text-green-600">
                      {event.ticketsAvailable.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sections */}
            {sections.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Available Sections</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{section.name}</h4>
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      )}
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Capacity:</span>
                          <span>{section.capacity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium">
                            {formatPrice(section.minPrice)} - {formatPrice(section.maxPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  From {formatPrice(event.minPrice)}
                </div>
                <div className="text-sm text-gray-500">
                  {event.ticketsAvailable} tickets available
                </div>
              </div>

              {user && user.role === UserRole.BUYER && (
                <Button 
                  onClick={handleMakeOffer} 
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Make an Offer
                </Button>
              )}

              {!user && (
                <div className="space-y-2">
                  <Link to="/login" className="block">
                    <Button className="w-full" size="lg">
                      Sign In to Make Offer
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button variant="outline" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleToggleFavorite}
                  className="flex-1"
                >
                  <Heart 
                    className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} 
                  />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>

          {/* Venue Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Venue Details</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{event.venue}</h4>
                <p className="text-sm text-gray-600">
                  {event.address}<br />
                  {event.city}, {event.state}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const query = encodeURIComponent(`${event.venue} ${event.address} ${event.city} ${event.state}`);
                  window.open(`https://maps.google.com/?q=${query}`, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Maps
              </Button>
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Event Status:</span>
                <span className={`font-medium ${event.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Listed:</span>
                <span>{new Date(event.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{new Date(event.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};