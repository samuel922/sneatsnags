import Stripe from 'stripe';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
      
      logger.info(`Stripe customer created: ${customer.id} for email: ${email}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, string>
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id} for amount: $${amount}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        ...(paymentMethodId && { payment_method: paymentMethodId }),
      });

      logger.info(`Payment intent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error confirming payment intent:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  async capturePaymentIntent(paymentIntentId: string, amountToCapture?: number) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId, {
        ...(amountToCapture && { amount_to_capture: Math.round(amountToCapture * 100) }),
      });

      logger.info(`Payment intent captured: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error capturing payment intent:', error);
      throw new Error('Failed to capture payment');
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
    metadata?: Record<string, string>
  ) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount: Math.round(amount * 100) }),
        reason,
        metadata,
      });

      logger.info(`Refund created: ${refund.id} for payment intent: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  async createTransfer(
    amount: number,
    destination: string,
    metadata?: Record<string, string>
  ) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination,
        metadata,
      });

      logger.info(`Transfer created: ${transfer.id} to ${destination} for amount: $${amount}`);
      return transfer;
    } catch (error) {
      logger.error('Error creating transfer:', error);
      throw new Error('Failed to create transfer');
    }
  }

  async createConnectedAccount(
    email: string,
    type: 'express' | 'standard' = 'express',
    country: string = 'US'
  ) {
    try {
      const account = await this.stripe.accounts.create({
        type,
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      logger.info(`Connected account created: ${account.id} for email: ${email}`);
      return account;
    } catch (error) {
      logger.error('Error creating connected account:', error);
      throw new Error('Failed to create connected account');
    }
  }

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      logger.info(`Account link created for account: ${accountId}`);
      return accountLink;
    } catch (error) {
      logger.error('Error creating account link:', error);
      throw new Error('Failed to create account link');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  async createSetupIntent(customerId: string, metadata?: Record<string, string>) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Setup intent created: ${setupIntent.id} for customer: ${customerId}`);
      return setupIntent;
    } catch (error) {
      logger.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  async listCustomerPaymentMethods(customerId: string, type: 'card' | 'us_bank_account' = 'card') {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type,
      });

      return paymentMethods;
    } catch (error) {
      logger.error('Error listing payment methods:', error);
      throw new Error('Failed to list payment methods');
    }
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string, endpointSecret: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return event;
    } catch (error) {
      logger.error('Error constructing webhook event:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  async calculateApplicationFee(amount: number, feePercentage: number = 0.05) {
    return Math.round(amount * feePercentage * 100); // Return in cents
  }
}

export const stripeService = new StripeService();