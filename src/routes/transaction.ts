import { Router } from "express";
import { transactionController } from "../controllers/transactionController";
import { authenticate } from "../middlewares/auth";
import { validateRole } from "../middlewares/validation";
import { UserRole } from "@prisma/client";

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/transactions/my-transactions:
 *   get:
 *     summary: Get current user's transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [buyer, seller]
 *     responses:
 *       200:
 *         description: User transactions retrieved successfully
 */
router.get("/my-transactions", transactionController.getUserTransactions);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction (when offer is accepted)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *               - listingId
 *             properties:
 *               offerId:
 *                 type: string
 *               listingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post("/", validateRole([UserRole.SELLER, UserRole.ADMIN]), transactionController.createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", transactionController.getTransactionById);

/**
 * @swagger
 * /api/transactions/{id}/process-payment:
 *   post:
 *     summary: Process payment for transaction (Buyers only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post("/:id/process-payment", validateRole([UserRole.BUYER, UserRole.ADMIN]), transactionController.processPayment);

/**
 * @swagger
 * /api/transactions/{id}/confirm-payment:
 *   post:
 *     summary: Confirm payment completion
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.post("/:id/confirm-payment", transactionController.confirmPayment);

/**
 * @swagger
 * /api/transactions/{id}/deliver-tickets:
 *   post:
 *     summary: Mark tickets as delivered (Sellers only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tickets marked as delivered successfully
 */
router.post("/:id/deliver-tickets", validateRole([UserRole.SELLER, UserRole.ADMIN]), transactionController.markTicketsDelivered);

/**
 * @swagger
 * /api/transactions/{id}/confirm-receipt:
 *   post:
 *     summary: Confirm ticket receipt (Buyers only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket receipt confirmed successfully
 */
router.post("/:id/confirm-receipt", validateRole([UserRole.BUYER, UserRole.ADMIN]), transactionController.confirmTicketReceipt);

/**
 * @swagger
 * /api/transactions/{id}/request-refund:
 *   post:
 *     summary: Request refund (Buyers only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund requested successfully
 */
router.post("/:id/request-refund", validateRole([UserRole.BUYER, UserRole.ADMIN]), transactionController.requestRefund);

/**
 * @swagger
 * /api/transactions/{id}/dispute:
 *   post:
 *     summary: Dispute transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction disputed successfully
 */
router.post("/:id/dispute", transactionController.disputeTransaction);

/**
 * @swagger
 * /api/transactions/{id}/cancel:
 *   post:
 *     summary: Cancel transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction cancelled successfully
 */
router.post("/:id/cancel", transactionController.cancelTransaction);

/**
 * @swagger
 * /api/transactions/events/{eventId}:
 *   get:
 *     summary: Get transactions by event
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event transactions retrieved successfully
 */
router.get("/events/:eventId", transactionController.getTransactionsByEvent);

// Admin-only routes
router.use(validateRole([UserRole.ADMIN]));

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All transactions retrieved successfully
 */
router.get("/", transactionController.getAllTransactions);

/**
 * @swagger
 * /api/transactions/stats:
 *   get:
 *     summary: Get transaction statistics (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
 */
router.get("/stats", transactionController.getTransactionStats);

/**
 * @swagger
 * /api/transactions/{id}/process-refund:
 *   post:
 *     summary: Process refund (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post("/:id/process-refund", transactionController.processRefund);

/**
 * @swagger
 * /api/transactions/{id}/resolve-dispute:
 *   post:
 *     summary: Resolve dispute (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *               refundAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 */
router.post("/:id/resolve-dispute", transactionController.resolveDispute);

/**
 * @swagger
 * /api/transactions/{id}/create-payment-intent:
 *   post:
 *     summary: Create payment intent for transaction (Buyers only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 */
router.post("/:id/create-payment-intent", validateRole([UserRole.BUYER, UserRole.ADMIN]), transactionController.createPaymentIntent);

/**
 * @swagger
 * /api/transactions/seller/create-account:
 *   post:
 *     summary: Create Stripe connected account for seller
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Seller account created successfully
 */
router.post("/seller/create-account", validateRole([UserRole.SELLER, UserRole.ADMIN]), transactionController.createSellerAccount);

/**
 * @swagger
 * /api/transactions/seller/onboarding-link:
 *   post:
 *     summary: Create seller onboarding link
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshUrl
 *               - returnUrl
 *             properties:
 *               refreshUrl:
 *                 type: string
 *               returnUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Onboarding link created successfully
 */
router.post("/seller/onboarding-link", validateRole([UserRole.SELLER, UserRole.ADMIN]), transactionController.createSellerOnboardingLink);

/**
 * @swagger
 * /api/transactions/{id}/seller-payout:
 *   post:
 *     summary: Process seller payout (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller payout processed successfully
 */
router.post("/:id/seller-payout", validateRole([UserRole.ADMIN]), transactionController.processSellerPayout);

/**
 * @swagger
 * /api/transactions/payment-methods/setup:
 *   post:
 *     summary: Setup customer payment method
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method setup initiated
 */
router.post("/payment-methods/setup", validateRole([UserRole.BUYER, UserRole.ADMIN]), transactionController.setupPaymentMethod);

/**
 * @swagger
 * /api/transactions/payment-methods:
 *   get:
 *     summary: Get customer payment methods
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get("/payment-methods", validateRole([UserRole.BUYER, UserRole.ADMIN]), transactionController.getPaymentMethods);

export { router as transactionRoutes };