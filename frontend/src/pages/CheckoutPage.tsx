import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PaymentForm } from '../components/payment/PaymentForm';
import { PaymentMethodsList } from '../components/payment/PaymentMethodsList';
import { PaymentMethodSetup } from '../components/payment/PaymentMethodSetup';
import { paymentService, type PaymentIntent, type SetupIntent } from '../services/paymentService';
import { transactionService } from '../services/transactionService';

export const CheckoutPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState<any>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [setupIntent, setSetupIntent] = useState<SetupIntent | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'payment' | 'setup' | 'success'>('payment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionAndPaymentIntent();
    }
  }, [transactionId]);

  const fetchTransactionAndPaymentIntent = async () => {
    try {
      setLoading(true);
      
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const [transactionData, paymentIntentData] = await Promise.all([
        transactionService.getTransaction(transactionId),
        paymentService.createPaymentIntent(transactionId)
      ]);

      setTransaction(transactionData);
      setPaymentIntent(paymentIntentData);
    } catch (err) {
      console.error('Failed to fetch transaction details:', err);
      setError('Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPaymentMethod = async () => {
    try {
      const setupIntentData = await paymentService.setupPaymentMethod();
      setSetupIntent(setupIntentData);
      setCurrentStep('setup');
    } catch (err) {
      console.error('Failed to setup payment method:', err);
      setError('Failed to setup payment method');
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSetupSuccess = () => {
    setCurrentStep('payment');
    setSetupIntent(null);
  };

  const handleSetupError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentStep('payment');
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Checkout</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your payment has been processed successfully. You should receive a confirmation email shortly.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate(`/transactions/${transactionId}`)}
              size="lg"
            >
              View Transaction Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          {transaction && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium">{transaction.event?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(transaction.event?.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{transaction.event?.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets:</span>
                  <span className="font-medium">{transaction.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Section:</span>
                  <span className="font-medium">{transaction.section}</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatAmount(transaction.totalAmount * 100)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Methods List */}
          {currentStep === 'payment' && (
            <PaymentMethodsList
              onAddPaymentMethod={handleSetupPaymentMethod}
              selectedPaymentMethodId={selectedPaymentMethod || undefined}
              onSelectPaymentMethod={setSelectedPaymentMethod}
              showSelection={true}
            />
          )}
        </div>

        {/* Payment Form */}
        <div>
          {currentStep === 'payment' && paymentIntent && (
            <PaymentForm
              clientSecret={paymentIntent.client_secret}
              amount={paymentIntent.amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {currentStep === 'setup' && setupIntent && (
            <PaymentMethodSetup
              clientSecret={setupIntent.client_secret}
              onSuccess={handleSetupSuccess}
              onError={handleSetupError}
            />
          )}
        </div>
      </div>
    </div>
  );
};