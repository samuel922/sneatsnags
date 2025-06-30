# Stripe Integration Guide

This document outlines the complete Stripe payment integration for the SneatSnags ticket marketplace platform.

## Overview

The platform uses Stripe for:
- Processing buyer payments
- Managing seller payouts via Stripe Connect
- Handling refunds and disputes
- Storing customer payment methods
- Webhook event processing

## Architecture

### Payment Flow
1. **Transaction Creation**: When an offer is accepted, a transaction is created
2. **Payment Intent**: Buyer initiates payment, creating a Stripe Payment Intent
3. **Payment Processing**: Payment is processed through Stripe
4. **Seller Payout**: Funds are transferred to seller's connected account
5. **Webhook Processing**: Real-time updates via Stripe webhooks

## Environment Variables

Add these to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## API Endpoints

### Payment Flow Endpoints

#### Create Payment Intent
```
POST /api/transactions/{id}/create-payment-intent
```
Creates a Stripe Payment Intent for the transaction.

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {...},
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

#### Process Payment
```
POST /api/transactions/{id}/process-payment
```
Confirms the payment with optional payment method.

**Request Body:**
```json
{
  "paymentMethodId": "pm_xxx" // Optional
}
```

### Seller Account Management

#### Create Seller Account
```
POST /api/transactions/seller/create-account
```
Creates a Stripe Connect account for the seller.

#### Create Onboarding Link
```
POST /api/transactions/seller/onboarding-link
```
Generates an onboarding link for seller verification.

**Request Body:**
```json
{
  "refreshUrl": "https://yourapp.com/onboarding/refresh",
  "returnUrl": "https://yourapp.com/onboarding/complete"
}
```

### Payment Methods

#### Setup Payment Method
```
POST /api/transactions/payment-methods/setup
```
Creates a setup intent for saving customer payment methods.

#### Get Payment Methods
```
GET /api/transactions/payment-methods
```
Retrieves customer's saved payment methods.

### Admin Endpoints

#### Process Seller Payout
```
POST /api/transactions/{id}/seller-payout
```
Manually triggers payout to seller (Admin only).

#### Process Refund
```
POST /api/transactions/{id}/process-refund
```
Processes a refund through Stripe (Admin only).

**Request Body:**
```json
{
  "amount": 100.00, // Optional, defaults to full amount
  "reason": "requested_by_customer" // Optional
}
```

## Webhook Integration

### Setup
1. Configure webhook endpoint in Stripe Dashboard: `https://yourapp.com/api/webhooks/stripe`
2. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `refund.created`
   - `transfer.created`
   - `account.updated`
   - `setup_intent.succeeded`

### Webhook Handler
The webhook controller automatically processes these events:

- **Payment Success**: Updates transaction status, triggers seller payout
- **Payment Failure**: Marks transaction as failed, releases listing
- **Refund Created**: Updates transaction with refund information
- **Transfer Created**: Confirms seller payout completion

## Database Schema Updates

The integration adds these fields to the Transaction model:

```prisma
model Transaction {
  // ... existing fields
  stripePaymentIntent   String?
  stripeTransferId      String?
  stripeRefundId        String?
  paidAt                DateTime?
  sellerPaidOut         Boolean           @default(false)
  sellerPaidOutAt       DateTime?
  // ... rest of fields
}
```

## Frontend Integration

### Stripe Elements Setup
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
```

### Payment Component Example
```javascript
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

function PaymentForm({ transactionId, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'Customer Name',
        },
      }
    });

    if (error) {
      console.error('Payment failed:', error);
    } else {
      console.log('Payment succeeded!');
      // Redirect to success page
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay Now
      </button>
    </form>
  );
}
```

## Testing

### Test Cards
Use Stripe's test cards for development:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **3D Secure**: `4000000000003220`

### Test Flow
1. Create a transaction by accepting an offer
2. Call `/create-payment-intent` endpoint
3. Use client secret with Stripe Elements
4. Confirm payment on frontend
5. Verify webhook events are processed

## Error Handling

The integration includes comprehensive error handling:

- **Payment Failures**: Automatic transaction rollback
- **Webhook Failures**: Retry mechanism via Stripe
- **Payout Failures**: Admin alerts and manual retry options
- **Refund Issues**: Detailed error logging and admin notifications

## Security Considerations

1. **API Keys**: Never expose secret keys on frontend
2. **Webhook Verification**: All webhooks are signature-verified
3. **Amount Validation**: Server-side validation of all amounts
4. **User Authorization**: Strict role-based access control
5. **Data Encryption**: Sensitive payment data is encrypted

## Monitoring

### Stripe Dashboard
Monitor transactions, payouts, and disputes in the Stripe Dashboard.

### Application Logs
Payment events are logged with structured data:

```json
{
  "level": "info",
  "message": "Payment intent created for transaction: tx_xxx",
  "transactionId": "tx_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 100.00,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Production Deployment

1. **Replace test keys** with live Stripe keys
2. **Update webhook endpoints** to production URLs
3. **Configure domain verification** for Stripe Connect
4. **Set up monitoring** for payment failures and disputes
5. **Test end-to-end flow** with small amounts

## Support

For Stripe-related issues:
1. Check Stripe Dashboard for payment details
2. Review application logs for integration errors
3. Contact Stripe support for platform-level issues
4. Use webhook event logs for debugging timing issues