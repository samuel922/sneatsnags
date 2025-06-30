import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import { logger } from "../utils/logger";
import { transactionService } from "../services/transactionService";
import { getPaginationParams, createPaginationResult } from "../utils/pagination";
import { AuthenticatedRequest } from "../types/auth";

export const transactionController = {
  // Get all transactions (admin only)
  getAllTransactions: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status, eventId, userId } = req.query;

      const result = await transactionService.getAllTransactions({
        skip,
        take: limit,
        status: status as string,
        eventId: eventId as string,
        userId: userId as string,
      });

      const paginatedResult = createPaginationResult(
        result.transactions,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Transactions retrieved"));
    } catch (error) {
      logger.error("Get all transactions error:", error);
      res.status(500).json(errorResponse("Failed to retrieve transactions"));
    }
  },

  // Get transaction by ID
  getTransactionById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const transaction = await transactionService.getTransactionByIdAdmin(id, userId, userRole);
      
      if (!transaction) {
        return res.status(404).json(errorResponse("Transaction not found"));
      }

      res.json(successResponse(transaction, "Transaction retrieved"));
    } catch (error) {
      logger.error("Get transaction by ID error:", error);
      res.status(500).json(errorResponse("Failed to retrieve transaction"));
    }
  },

  // Get user's transactions (buyer/seller)
  getUserTransactions: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status, role } = req.query;

      const result = await transactionService.getUserTransactions(userId, {
        skip,
        take: limit,
        status: status as string,
        role: role as 'buyer' | 'seller',
      });

      const paginatedResult = createPaginationResult(
        result.transactions,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "User transactions retrieved"));
    } catch (error) {
      logger.error("Get user transactions error:", error);
      res.status(500).json(errorResponse("Failed to retrieve user transactions"));
    }
  },

  // Create transaction (when offer is accepted)
  createTransaction: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { offerId, listingId } = req.body;
      const sellerId = req.user!.id;
      
      const transaction = await transactionService.createTransaction({
        offerId,
        listingId,
        sellerId,
      });

      res.status(201).json(successResponse(transaction, "Transaction created successfully"));
    } catch (error) {
      logger.error("Create transaction error:", error);
      res.status(500).json(errorResponse("Failed to create transaction"));
    }
  },

  // Create payment intent
  createPaymentIntent: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const buyerId = req.user!.id;
      
      const result = await transactionService.createPaymentIntent(id, buyerId);
      res.json(successResponse(result, "Payment intent created successfully"));
    } catch (error) {
      logger.error("Create payment intent error:", error);
      res.status(500).json(errorResponse("Failed to create payment intent"));
    }
  },

  // Process payment
  processPayment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentMethodId } = req.body;
      const buyerId = req.user!.id;
      
      const result = await transactionService.processPayment(id, buyerId, paymentMethodId);
      res.json(successResponse(result, "Payment processed successfully"));
    } catch (error) {
      logger.error("Process payment error:", error);
      res.status(500).json(errorResponse("Failed to process payment"));
    }
  },

  // Confirm payment
  confirmPayment: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;
      
      const transaction = await transactionService.confirmPayment(id, paymentIntentId);
      res.json(successResponse(transaction, "Payment confirmed successfully"));
    } catch (error) {
      logger.error("Confirm payment error:", error);
      res.status(500).json(errorResponse("Failed to confirm payment"));
    }
  },

  // Mark tickets as delivered
  markTicketsDelivered: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const sellerId = req.user!.id;
      
      const transaction = await transactionService.markTicketsDelivered(id, sellerId);
      res.json(successResponse(transaction, "Tickets marked as delivered"));
    } catch (error) {
      logger.error("Mark tickets delivered error:", error);
      res.status(500).json(errorResponse("Failed to mark tickets as delivered"));
    }
  },

  // Confirm ticket receipt
  confirmTicketReceipt: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const buyerId = req.user!.id;
      
      const transaction = await transactionService.confirmTicketReceipt(id, buyerId);
      res.json(successResponse(transaction, "Ticket receipt confirmed"));
    } catch (error) {
      logger.error("Confirm ticket receipt error:", error);
      res.status(500).json(errorResponse("Failed to confirm ticket receipt"));
    }
  },

  // Request refund
  requestRefund: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const buyerId = req.user!.id;
      
      const transaction = await transactionService.requestRefund(id, buyerId, reason);
      res.json(successResponse(transaction, "Refund requested successfully"));
    } catch (error) {
      logger.error("Request refund error:", error);
      res.status(500).json(errorResponse("Failed to request refund"));
    }
  },

  // Process refund (admin only)
  processRefund: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;
      
      const transaction = await transactionService.processRefund(id, amount, reason);
      res.json(successResponse(transaction, "Refund processed successfully"));
    } catch (error) {
      logger.error("Process refund error:", error);
      res.status(500).json(errorResponse("Failed to process refund"));
    }
  },

  // Dispute transaction
  disputeTransaction: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user!.id;
      
      const transaction = await transactionService.disputeTransaction(id, userId, reason);
      res.json(successResponse(transaction, "Transaction disputed successfully"));
    } catch (error) {
      logger.error("Dispute transaction error:", error);
      res.status(500).json(errorResponse("Failed to dispute transaction"));
    }
  },

  // Resolve dispute (admin only)
  resolveDispute: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { resolution, refundAmount } = req.body;
      
      const transaction = await transactionService.resolveDispute(id, resolution, refundAmount);
      res.json(successResponse(transaction, "Dispute resolved successfully"));
    } catch (error) {
      logger.error("Resolve dispute error:", error);
      res.status(500).json(errorResponse("Failed to resolve dispute"));
    }
  },

  // Get transaction statistics (admin only)
  getTransactionStats: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { period, eventId } = req.query;
      const stats = await transactionService.getTransactionStats({
        period: period as string,
        eventId: eventId as string,
      });
      res.json(successResponse(stats, "Transaction statistics retrieved"));
    } catch (error) {
      logger.error("Get transaction stats error:", error);
      res.status(500).json(errorResponse("Failed to retrieve transaction statistics"));
    }
  },

  // Get transaction by event
  getTransactionsByEvent: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status } = req.query;

      const result = await transactionService.getTransactionsByEvent(eventId, {
        skip,
        take: limit,
        status: status as string,
      });

      const paginatedResult = createPaginationResult(
        result.transactions,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Event transactions retrieved"));
    } catch (error) {
      logger.error("Get transactions by event error:", error);
      res.status(500).json(errorResponse("Failed to retrieve event transactions"));
    }
  },

  // Cancel transaction
  cancelTransaction: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const transaction = await transactionService.cancelTransaction(id, userId, userRole, reason);
      res.json(successResponse(transaction, "Transaction cancelled successfully"));
    } catch (error) {
      logger.error("Cancel transaction error:", error);
      res.status(500).json(errorResponse("Failed to cancel transaction"));
    }
  },

  // Create seller Stripe account
  createSellerAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const email = req.user!.email;
      
      const account = await transactionService.createSellerAccount(sellerId, email);
      res.status(201).json(successResponse(account, "Seller account created successfully"));
    } catch (error) {
      logger.error("Create seller account error:", error);
      res.status(500).json(errorResponse("Failed to create seller account"));
    }
  },

  // Create seller onboarding link
  createSellerOnboardingLink: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { refreshUrl, returnUrl } = req.body;
      
      if (!refreshUrl || !returnUrl) {
        return res.status(400).json(errorResponse("refreshUrl and returnUrl are required"));
      }
      
      const accountLink = await transactionService.createSellerOnboardingLink(sellerId, refreshUrl, returnUrl);
      res.json(successResponse(accountLink, "Onboarding link created successfully"));
    } catch (error) {
      logger.error("Create seller onboarding link error:", error);
      res.status(500).json(errorResponse("Failed to create onboarding link"));
    }
  },

  // Process seller payout
  processSellerPayout: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const transaction = await transactionService.processSellerPayout(id);
      res.json(successResponse(transaction, "Seller payout processed successfully"));
    } catch (error) {
      logger.error("Process seller payout error:", error);
      res.status(500).json(errorResponse("Failed to process seller payout"));
    }
  },

  // Setup customer payment method
  setupPaymentMethod: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const customerId = req.user!.stripeCustomerId;
      
      if (!customerId) {
        return res.status(400).json(errorResponse("Customer must have a Stripe customer ID"));
      }
      
      const result = await transactionService.setupCustomerPaymentMethod(customerId);
      res.json(successResponse(result, "Payment method setup initiated"));
    } catch (error) {
      logger.error("Setup payment method error:", error);
      res.status(500).json(errorResponse("Failed to setup payment method"));
    }
  },

  // Get customer payment methods
  getPaymentMethods: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const customerId = req.user!.stripeCustomerId;
      
      if (!customerId) {
        return res.status(400).json(errorResponse("Customer must have a Stripe customer ID"));
      }
      
      const paymentMethods = await transactionService.getCustomerPaymentMethods(customerId);
      res.json(successResponse(paymentMethods, "Payment methods retrieved"));
    } catch (error) {
      logger.error("Get payment methods error:", error);
      res.status(500).json(errorResponse("Failed to retrieve payment methods"));
    }
  },
};