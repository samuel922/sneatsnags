import React, { createContext, useContext, type ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// This should come from environment variables in a real app
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeContextType {
  stripe: ReturnType<typeof loadStripe>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const contextValue: StripeContextType = {
    stripe: stripePromise,
  };

  return (
    <StripeContext.Provider value={contextValue}>
      <Elements 
        stripe={stripePromise}
        options={{
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#ffffff',
              colorText: '#374151',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              borderRadius: '8px',
            },
          },
        }}
      >
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};