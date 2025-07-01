import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateOfferForm } from '../components/offers/CreateOfferForm';
import type { Event } from '../types/event';
import { apiClient } from '../services/api';

export const CreateOfferPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<Event>(`/events/${eventId}`);
        setEvent(response.data!);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleSuccess = (offer: any) => {
    navigate(`/offers/${offer.id}`, { 
      state: { message: 'Offer created successfully!' }
    });
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Event
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Make an Offer</h1>
          <p className="text-gray-600 mt-2">
            Create an offer for tickets to this event. Sellers will be notified and can accept your offer.
          </p>
        </div>

        {/* Form */}
        <CreateOfferForm
          event={event}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};