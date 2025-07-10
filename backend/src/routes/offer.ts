import { Router } from "express";
import { offerController } from "../controllers/offerController";
import { authenticate } from "../middlewares/auth";
import { validateRole } from "../middlewares/validation";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all active offers (public - for sellers)
 *     tags: [Offers]
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
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 */
router.get("/", offerController.getOffers);

/**
 * @swagger
 * /api/offers/search:
 *   get:
 *     summary: Search offers
 *     tags: [Offers]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get("/search", offerController.searchOffers);

/**
 * @swagger
 * /api/offers/recent:
 *   get:
 *     summary: Get recent offers
 *     tags: [Offers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recent offers retrieved successfully
 */
router.get("/recent", offerController.getRecentOffers);

/**
 * @swagger
 * /api/offers/stats:
 *   get:
 *     summary: Get offer statistics
 *     tags: [Offers]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer statistics retrieved successfully
 */
router.get("/stats", offerController.getOfferStats);

/**
 * @swagger
 * /api/offers/events/{eventId}:
 *   get:
 *     summary: Get offers by event
 *     tags: [Offers]
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
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event offers retrieved successfully
 */
router.get("/events/:eventId", offerController.getOffersByEvent);

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer retrieved successfully
 *       404:
 *         description: Offer not found
 */
router.get("/:id", offerController.getOfferById);

// Authenticated routes (buyer actions)
router.use(authenticate);

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create a new offer (Buyers only)
 *     tags: [Offers]
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
 *               - maxPrice
 *               - quantity
 *               - expiresAt
 *             properties:
 *               eventId:
 *                 type: string
 *               maxPrice:
 *                 type: number
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               message:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Offer created successfully
 */
router.post("/", validateRole([UserRole.BUYER, UserRole.ADMIN]), offerController.createOffer);

/**
 * @swagger
 * /api/offers/my-offers:
 *   get:
 *     summary: Get current user's offers (Buyers only)
 *     tags: [Offers]
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
 *     responses:
 *       200:
 *         description: Buyer offers retrieved successfully
 */
router.get("/my-offers", validateRole([UserRole.BUYER, UserRole.ADMIN]), offerController.getBuyerOffers);

/**
 * @swagger
 * /api/offers/{id}:
 *   put:
 *     summary: Update an offer (Buyers only - own offers)
 *     tags: [Offers]
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
 *         description: Offer updated successfully
 */
router.put("/:id", validateRole([UserRole.BUYER, UserRole.ADMIN]), offerController.updateOffer);

/**
 * @swagger
 * /api/offers/{id}/cancel:
 *   post:
 *     summary: Cancel an offer (Buyers only - own offers)
 *     tags: [Offers]
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
 *         description: Offer cancelled successfully
 */
router.post("/:id/cancel", validateRole([UserRole.BUYER, UserRole.ADMIN]), offerController.cancelOffer);

/**
 * @swagger
 * /api/offers/{id}/extend:
 *   post:
 *     summary: Extend offer expiry (Buyers only - own offers)
 *     tags: [Offers]
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
 *               - expiresAt
 *             properties:
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Offer extended successfully
 */
router.post("/:id/extend", validateRole([UserRole.BUYER, UserRole.ADMIN]), offerController.extendOffer);

export { router as offerRoutes };