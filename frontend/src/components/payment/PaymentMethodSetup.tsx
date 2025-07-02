import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Loader2, Plus, AlertCircle } from 'lucide-react';

interface PaymentMethodSetupProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PaymentMethodSetup: React.FC<PaymentMethodSetupProps> = ({
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/setup-complete`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Failed to save payment method');
        } else {
          setErrorMessage('An unexpected error occurred');
        }
        onError(error.message || 'Failed to save payment method');
      } else if (setupIntent && setupIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      console.error('Setup error:', err);
      setErrorMessage('An unexpected error occurred');
      onError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Payment Method
        </h3>
        <p className="text-gray-600 text-sm">
          Save a payment method for faster checkout on future purchases.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="min-h-[200px]">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>

        {errorMessage && (
          <div className="flex items-center p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={!stripe || !elements || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving Payment Method...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Save Payment Method
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Your payment information is securely stored and encrypted.
          </p>
        </div>
      </form>
    </Card>
  );
};