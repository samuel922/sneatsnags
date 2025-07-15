import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { buyerService } from '../../services/buyerService';
import { offerService } from '../../services/offerService';
import { useAuth } from '../../hooks/useAuth';
import type { PriceSuggestion } from '../../types/offer';
import type { Event } from '../../types/event';
import SweetAlert from '../../utils/sweetAlert';

const createOfferSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  sectionIds: z.array(z.string()).min(1, 'At least one section is required'),
  maxPrice: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Price must be a positive number'
  ),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 tickets'),
  message: z.string(),
  expirationDays: z.number().min(1, 'Expiration must be at least 1 day').max(30, 'Maximum 30 days')
});

type CreateOfferSchemaType = z.infer<typeof createOfferSchema>;

interface CreateOfferFormProps {
  event: Event;
  onSuccess?: (offer: any) => void;
  onCancel?: () => void;
}

export const CreateOfferForm: React.FC<CreateOfferFormProps> = ({
  event,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [loadingPriceSuggestion, setLoadingPriceSuggestion] = useState(true);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateOfferSchemaType>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      eventId: event.id,
      sectionIds: [],
      maxPrice: '',
      quantity: 1,
      message: '',
      expirationDays: 7
    }
  });

  const watchedSections = watch('sectionIds');

  // Load price suggestions when component mounts or sections change
  useEffect(() => {
    const loadPriceSuggestions = async () => {
      setLoadingPriceSuggestion(true);
      try {
        const suggestions = await offerService.getPriceSuggestions(
          event.id,
          selectedSections.length > 0 ? selectedSections : undefined
        );
        setPriceSuggestion(suggestions);
        
        // Auto-fill suggested price if no price is set
        const currentPrice = watch('maxPrice');
        if (!currentPrice && suggestions.suggestedPrice) {
          setValue('maxPrice', suggestions.suggestedPrice.toString());
        }
      } catch (error) {
        console.error('Failed to load price suggestions:', error);
      } finally {
        setLoadingPriceSuggestion(false);
      }
    };

    loadPriceSuggestions();
  }, [event.id, selectedSections, setValue, watch]);

  // Update selected sections when form value changes
  useEffect(() => {
    setSelectedSections(watchedSections || []);
  }, [watchedSections]);

  const onSubmit = async (data: CreateOfferSchemaType) => {
    if (!user) {
      SweetAlert.error('Authentication Required', 'You must be logged in to create an offer');
      return;
    }

    setIsLoading(true);
    try {
      SweetAlert.loading('Creating Offer', 'Please wait while we submit your offer...');
      
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + data.expirationDays);

      const offerData = {
        eventId: data.eventId,
        sectionIds: data.sectionIds,
        maxPrice: parseFloat(data.maxPrice),
        quantity: data.quantity,
        message: data.message || undefined,
        expiresAt: expirationDate.toISOString()
      };

      const newOffer = await buyerService.createOffer(offerData);
      
      SweetAlert.close();
      SweetAlert.success('Offer Created!', 'Your offer has been submitted successfully and sellers will be notified');
      
      if (onSuccess) {
        onSuccess(newOffer);
      }
    } catch (error: any) {
      console.error('Failed to create offer:', error);
      SweetAlert.close();
      SweetAlert.error('Failed to Create Offer', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggestedPrice = () => {
    if (priceSuggestion?.suggestedPrice) {
      setValue('maxPrice', priceSuggestion.suggestedPrice.toString());
    }
  };

  const handleSectionChange = (sectionId: string, checked: boolean) => {
    const currentSections = watch('sectionIds') || [];
    const newSections = checked
      ? [...currentSections, sectionId]
      : currentSections.filter(id => id !== sectionId);
    
    setValue('sectionIds', newSections);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Offer</h2>
        <div className="text-sm text-gray-600">
          <p className="font-medium">{event.name}</p>
          <p>{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
          <p>{event.city}, {event.state}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Sections *
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
            {event.sections?.map((section) => (
              <label key={section.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  onChange={(e) => handleSectionChange(section.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{section.name}</span>
              </label>
            ))}
          </div>
          {errors.sectionIds && (
            <p className="mt-1 text-sm text-red-600">{errors.sectionIds.message}</p>
          )}
        </div>

        {/* Price Suggestion Section */}
        {priceSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Price Suggestions</h3>
            
            {loadingPriceSuggestion ? (
              <div className="animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-blue-200 rounded w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Suggested Price:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-blue-900">
                      ${priceSuggestion.suggestedPrice}
                    </span>
                    <button
                      type="button"
                      onClick={handleUseSuggestedPrice}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Use This
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-blue-600">
                  <div>Average: ${priceSuggestion.averagePrice}</div>
                  <div>Median: ${priceSuggestion.medianPrice}</div>
                  <div>Competitive Range: ${priceSuggestion.priceRange.low} - ${priceSuggestion.priceRange.high}</div>
                  <div>Recent Offers: {priceSuggestion.recentOffers}</div>
                </div>
                
                <p className="text-xs text-blue-600 mt-2">
                  Based on {priceSuggestion.totalOffers} offers for this event. 
                  Suggested price is the 75th percentile of recent offers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Max Price */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Price Per Ticket *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              {...register('maxPrice')}
              type="text"
              id="maxPrice"
              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          {errors.maxPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.maxPrice.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Tickets *
          </label>
          <select
            {...register('quantity', { valueAsNumber: true })}
            id="quantity"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>

        {/* Expiration */}
        <div>
          <label htmlFor="expirationDays" className="block text-sm font-medium text-gray-700 mb-1">
            Offer Expires In *
          </label>
          <select
            {...register('expirationDays', { valueAsNumber: true })}
            id="expirationDays"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          {errors.expirationDays && (
            <p className="mt-1 text-sm text-red-600">{errors.expirationDays.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Message (Optional)
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional details about your offer..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};