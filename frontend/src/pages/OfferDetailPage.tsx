import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Share2,
  Heart,
  Ticket
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { offerService } from '../services/offerService';
import { useAuth } from '../hooks/useAuth';
import type { Offer } from '../types/offer';

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOffer(id);
    }
  }, [id, isAuthenticated, user]);

  const fetchOffer = async (offerId: string) => {
    try {
      setLoading(true);
      console.log('Fetching offer with ID:', offerId);
      
      // Try to get offer from public API first
      try {
        console.log('Trying public offer API...');
        const response = await offerService.getOfferById(offerId);
        console.log('Public offer API response:', response);
        setOffer(response);
        return;
      } catch (publicError) {
        console.log('Public offer API failed, trying user-specific API:', publicError);
      }
      
      // If public API fails and user is authenticated, try buyer-specific API
      if (isAuthenticated && user?.role === 'BUYER') {
        try {
          console.log('Trying buyer-specific offer API...');
          const { buyerService } = await import('../services/buyerService');
          const response = await buyerService.getOffer(offerId);
          console.log('Buyer offer API response:', response);
          setOffer(response);
          return;
        } catch (buyerError) {
          console.log('Buyer-specific offer API failed:', buyerError);
        }
      }
      
      // If all attempts fail, show error
      throw new Error('Offer not found');
      
    } catch (err) {
      console.error('Failed to fetch offer:', err);
      setError('Offer not found or no longer available');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      ACCEPTED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Accepted' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Expired' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        <Icon className="h-4 w-4 mr-2" />
        {config.text}
      </span>
    );
  };

  const isOfferExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const canAcceptOffer = () => {
    return isAuthenticated && 
           user?.role === 'SELLER' && 
           offer?.status === 'ACTIVE' && 
           !isOfferExpired(offer.expiresAt);
  };

  const handleAcceptOffer = () => {
    // TODO: Implement offer acceptance logic
    console.log('Accept offer:', offer?.id);
  };

  const handleContactBuyer = () => {
    // TODO: Implement buyer contact functionality
    console.log('Contact buyer for offer:', offer?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <Card variant="glass">
              <CardContent className="p-8">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            to="/offers"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse Offers
          </Link>
          
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || "This offer may have been removed or is no longer available."}
              </p>
              <Button onClick={() => navigate('/offers')}>
                Browse Other Offers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/offers"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse Offers
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card variant="glass" className="backdrop-blur-xl border-white/30">
          <CardContent className="p-8">
            {/* Status and Price Header */}
            <div className="flex items-center justify-between mb-6">
              {getStatusBadge(offer.status)}
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(offer.maxPrice)}
                </div>
                <div className="text-sm text-gray-500">per ticket</div>
              </div>
            </div>

            {/* Event Information */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {offer.event.name}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Event Date</div>
                      <div className="text-sm">{formatDate(offer.event.eventDate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{offer.event.venue}</div>
                      <div className="text-sm">{offer.event.city}, {offer.event.state}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Ticket className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Quantity Requested</div>
                      <div className="text-sm">{offer.quantity} ticket{offer.quantity > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Buyer</div>
                      <div className="text-sm">{offer.buyer.firstName} {offer.buyer.lastName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Offer Expires</div>
                      <div className="text-sm">{formatDate(offer.expiresAt)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Total Value</div>
                      <div className="text-sm">{formatPrice(offer.maxPrice * offer.quantity)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections Requested */}
            {offer.sections && offer.sections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Sections</h3>
                <div className="flex flex-wrap gap-2">
                  {offer.sections.map((section, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {section.section.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {offer.message && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Buyer's Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{offer.message}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
              {canAcceptOffer() && (
                <Button 
                  onClick={handleAcceptOffer}
                  className="flex-1"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Accept Offer
                </Button>
              )}
              
              {isAuthenticated && user?.role === 'SELLER' && (
                <Button 
                  variant="outline" 
                  onClick={handleContactBuyer}
                  className="flex-1"
                  size="lg"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Buyer
                </Button>
              )}
              
              {!isAuthenticated && (
                <div className="flex-1">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                    size="lg"
                  >
                    Login to Respond
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Sellers can accept offers and contact buyers
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Offer</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(offer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{formatDate(offer.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Offer ID:</span>
                  <span className="font-mono">{offer.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Verify ticket authenticity before accepting</li>
                <li>• Use platform's secure payment system</li>
                <li>• Communicate through the platform</li>
                <li>• Check buyer's rating and reviews</li>
                <li>• Ensure ticket transfer is completed</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};