import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import {
  createOffer,
  getMyOffers,
  getOffer,
  updateOffer,
  cancelOffer,
  searchEvents,
  getEvent,
  getEventOffers,
  getBuyerDashboard,
} from "../controllers/buyerController";

import {
  getPopularEvents,
  getSuggestedEvents,
} from "../controllers/searchController";

const router = Router();

// All buyer routes require authentication and buyer role
router.use(authenticate);
router.use(authorize("BUYER", "ADMIN"));

/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         eventId:
 *           type: string
 *         maxPrice:
 *           type: number
 *         quantity:
 *           type: integer
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, ACCEPTED, EXPIRED, CANCELLED]
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/buyers/dashboard:
 *   get:
 *     summary: Get buyer dashboard
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buyer dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/dashboard", getBuyerDashboard);

/**
 * @swagger
 * /api/buyers/offers:
 *   post:
 *     summary: Create a new offer
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - sectionIds
 *               - maxPrice
 *               - quantity
 *               - expiresAt
 *             properties:
 *               eventId:
 *                 type: string
 *               sectionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxPrice:
 *                 type: number
 *                 minimum: 0.01
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               message:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Offer created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post("/offers", createOffer);

/**
 * @swagger
 * /api/buyers/offers:
 *   get:
 *     summary: Get buyer's offers
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ACCEPTED, EXPIRED, CANCELLED]
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/offers", getMyOffers);

/**
 * @swagger
 * /api/buyers/offers/{offerId}:
 *   get:
 *     summary: Get specific offer
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer retrieved successfully
 *       404:
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/offers/:offerId", getOffer);

/**
 * @swagger
 * /api/buyers/offers/{offerId}:
 *   put:
 *     summary: Update offer
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxPrice:
 *                 type: number
 *                 minimum: 0.01
 *               message:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       400:
 *         description: Validation error or cannot update offer
 *       404:
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/buyers/events/popular:
 *   get:
 *     summary: Get popular events
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Popular events retrieved successfully
 */
router.get("/events/popular", getPopularEvents);

/**
 * @swagger
 * /api/buyers/events/suggested:
 *   get:
 *     summary: Get suggested events based on user preferences
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Suggested events retrieved successfully
 */
router.get("/events/suggested", getSuggestedEvents);

export { router as buyerRoutes };
