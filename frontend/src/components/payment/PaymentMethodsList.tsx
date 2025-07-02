import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { paymentService, type PaymentMethod } from '../../services/paymentService';

interface PaymentMethodsListProps {
  onAddPaymentMethod: () => void;
  selectedPaymentMethodId?: string;
  onSelectPaymentMethod?: (paymentMethodId: string) => void;
  showSelection?: boolean;
}

export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  onAddPaymentMethod,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  showSelection = false,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const getCardBrandIcon = () => {
    // In a real app, you'd use actual card brand icons
    return <CreditCard className="h-5 w-5" />;
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      // TODO: Implement delete payment method API
      // await paymentService.deletePaymentMethod(paymentMethodId);
      setPaymentMethods(methods => methods.filter(m => m.id !== paymentMethodId));
    } catch (err) {
      console.error('Failed to delete payment method:', err);
      alert('Failed to delete payment method');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPaymentMethods} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <Button onClick={onAddPaymentMethod} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h4>
          <p className="text-gray-600 mb-4">
            Add a payment method to make purchases faster and easier.
          </p>
          <Button onClick={onAddPaymentMethod}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`
                border rounded-lg p-4 transition-all
                ${showSelection ? 'cursor-pointer hover:border-primary-300' : ''}
                ${selectedPaymentMethodId === method.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
              `}
              onClick={() => showSelection && onSelectPaymentMethod?.(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {showSelection && (
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethodId === method.id}
                      onChange={() => onSelectPaymentMethod?.(method.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                  )}
                  
                  <div className="flex items-center space-x-3">
                    {method.card && getCardBrandIcon()}
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.card && (
                          <span>
                            {method.card.brand.toUpperCase()} •••• {method.card.last4}
                          </span>
                        )}
                      </div>
                      {method.card && (
                        <div className="text-sm text-gray-600">
                          Expires {formatExpiryDate(method.card.exp_month, method.card.exp_year)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!showSelection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};