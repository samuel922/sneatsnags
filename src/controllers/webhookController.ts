import { Request, Response } from "express";
import { stripeService } from "../services/stripeService";
import { transactionService } from "../services/transactionService";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

export const webhookController = {
  // Handle Stripe webhooks
  handleStripeWebhook: async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!signature) {
      logger.error('Missing Stripe signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    try {
      // Construct the event from the webhook payload
      const event = await stripeService.constructWebhookEvent(
        req.body,
        signature,
        endpointSecret
      );

      logger.info(`Received Stripe webhook: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await handlePaymentIntentCanceled(event.data.object);
          break;

        case 'refund.created':
          await handleRefundCreated(event.data.object);
          break;

        case 'transfer.created':
          await handleTransferCreated(event.data.object);
          break;

        case 'account.updated':
          await handleAccountUpdated(event.data.object);
          break;

        case 'setup_intent.succeeded':
          await handleSetupIntentSucceeded(event.data.object);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook handler failed' });
    }
  },
};

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const transactionId = paymentIntent.metadata?.transactionId;
    
    if (!transactionId) {
      logger.error('No transaction ID in payment intent metadata');
      return;
    }

    // Update transaction status to completed
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });

    // Trigger seller payout after successful payment
    try {
      await transactionService.processSellerPayout(transactionId);
    } catch (error) {
      logger.error(`Failed to process seller payout for transaction ${transactionId}:`, error);
      // Don't fail the webhook - payout can be retried manually
    }

    logger.info(`Payment succeeded for transaction: ${transactionId}`);
  } catch (error) {
    logger.error('Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const transactionId = paymentIntent.metadata?.transactionId;
    
    if (!transactionId) {
      logger.error('No transaction ID in payment intent metadata');
      return;
    }

    // Update transaction status to failed
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "FAILED",
        notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      },
    });

    // Free up the listing again
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (transaction) {
      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: "AVAILABLE" },
      });
    }

    logger.info(`Payment failed for transaction: ${transactionId}`);
  } catch (error) {
    logger.error('Error handling payment_intent.payment_failed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: any) {
  try {
    const transactionId = paymentIntent.metadata?.transactionId;
    
    if (!transactionId) {
      logger.error('No transaction ID in payment intent metadata');
      return;
    }

    // Update transaction status to failed
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "FAILED",
        notes: "Payment was canceled",
      },
    });

    // Free up the listing again
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (transaction) {
      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: "AVAILABLE" },
      });
    }

    logger.info(`Payment canceled for transaction: ${transactionId}`);
  } catch (error) {
    logger.error('Error handling payment_intent.canceled:', error);
  }
}

async function handleRefundCreated(refund: any) {
  try {
    const transactionId = refund.metadata?.transactionId;
    
    if (!transactionId) {
      logger.error('No transaction ID in refund metadata');
      return;
    }

    // Update transaction with refund information
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "REFUNDED",
        refundAmount: refund.amount / 100, // Convert from cents
        refundedAt: new Date(refund.created * 1000),
        stripeRefundId: refund.id,
      },
    });

    logger.info(`Refund created for transaction: ${transactionId}, refund ID: ${refund.id}`);
  } catch (error) {
    logger.error('Error handling refund.created:', error);
  }
}

async function handleTransferCreated(transfer: any) {
  try {
    const transactionId = transfer.metadata?.transactionId;
    const sellerId = transfer.metadata?.sellerId;
    
    if (!transactionId || !sellerId) {
      logger.error('Missing transaction ID or seller ID in transfer metadata');
      return;
    }

    // Update transaction with transfer information
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        sellerPaidOut: true,
        sellerPaidOutAt: new Date(transfer.created * 1000),
        stripeTransferId: transfer.id,
      },
    });

    logger.info(`Transfer created for transaction: ${transactionId}, transfer ID: ${transfer.id}`);
  } catch (error) {
    logger.error('Error handling transfer.created:', error);
  }
}

async function handleAccountUpdated(account: any) {
  try {
    // Update seller account status based on Stripe account details
    const user = await prisma.user.findFirst({
      where: { stripeAccountId: account.id },
    });

    if (user) {
      // You could update user status based on account.details_submitted, account.charges_enabled, etc.
      logger.info(`Stripe account updated for user: ${user.id}, account: ${account.id}`);
    }
  } catch (error) {
    logger.error('Error handling account.updated:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: any) {
  try {
    // Log successful payment method setup
    logger.info(`Setup intent succeeded: ${setupIntent.id} for customer: ${setupIntent.customer}`);
    
    // You could trigger notifications or update user preferences here
  } catch (error) {
    logger.error('Error handling setup_intent.succeeded:', error);
  }
}