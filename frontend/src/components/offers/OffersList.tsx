import React, { useState, useEffect } from 'react';
import { offerService } from '../../services/offerService';
import type { Offer } from '../../types/offer';

interface OffersListProps {
  eventId?: string;
  showUserOffersOnly?: boolean;
  limit?: number;
}

export const OffersList: React.FC<OffersListProps> = ({
  eventId,
  showUserOffersOnly = false,
  limit = 10
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      try {
        let offersData: Offer[] = [];
        
        if (showUserOffersOnly) {
          offersData = await offerService.getMyOffers();
        } else if (eventId) {
          const result = await offerService.getOffersByEvent(eventId, { limit });
          offersData = result.offers;
        } else {
          const result = await offerService.getOffers({ limit });
          offersData = result.offers;
        }
        
        setOffers(offersData);
      } catch (err: any) {
        setError(err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [eventId, showUserOffersOnly, limit]);

  const handleCancelOffer = async (offerId: string) => {
    try {
      await offerService.cancelOffer(offerId);
      setOffers(offers.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'CANCELLED' as const }
          : offer
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel offer');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg mb-2">Failed to load offers</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No offers found</div>
        <p className="text-gray-600">
          {showUserOffersOnly 
            ? "You haven't made any offers yet." 
            : "No offers available for this event."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              {offer.event && (
                <h3 className="font-semibold text-gray-900 mb-1">
                  {offer.event.name}
                </h3>
              )}
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">${offer.maxPrice}</span> per ticket • 
                <span className="ml-1">{offer.quantity} ticket{offer.quantity > 1 ? 's' : ''}</span>
              </div>
              {offer.sections && offer.sections.length > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  Sections: {offer.sections.map(s => s.section?.name).join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>
                {offer.status}
              </span>
              
              {offer.status === 'ACTIVE' && showUserOffersOnly && (
                <button
                  onClick={() => handleCancelOffer(offer.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {offer.message && (
            <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-3">
              "{offer.message}"
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Created {new Date(offer.createdAt).toLocaleDateString()}</span>
            <span>Expires {new Date(offer.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};