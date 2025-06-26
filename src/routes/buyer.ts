import { Router } from "express";
import {
  createOffer,
  listOffers,
  getOffer,
  updateOffer,
  cancelOffer,
} from "../controllers/buyerController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

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
 *               - maxPrice
 *               - quantity
 *               - sectionIds
 *               - expiresAt
 *             properties:
 *               eventId:
 *                 type: string
 *               maxPrice:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               sectionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               message:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Offer created
 *       400:
 *         description: Validation error
 */
router.post("/offers", authenticate, authorize("BUYER"), createOffer);

/**
 * @swagger
 * /api/buyers/offers:
 *   get:
 *     summary: List buyer offers
 *     tags: [Buyers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: Offer list
 */
router.get("/offers", authenticate, authorize("BUYER"), listOffers);

/**
 * @swagger
 * /api/buyers/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     tags: [Buyers]
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
 *         description: Offer details
 *       404:
 *         description: Offer not found
 */
router.get("/offers/:id", authenticate, authorize("BUYER"), getOffer);

/**
 * @swagger
 * /api/buyers/offers/{id}:
 *   put:
 *     summary: Update an offer
 *     tags: [Buyers]
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
 *             properties:
 *               eventId:
 *                 type: string
 *               maxPrice:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               sectionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               message:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Offer updated
 *       400:
 *         description: Validation error
 */
router.put("/offers/:id", authenticate, authorize("BUYER"), updateOffer);

/**
 * @swagger
 * /api/buyers/offers/{id}:
 *   delete:
 *     summary: Cancel an offer
 *     tags: [Buyers]
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
 *         description: Offer cancelled
 */
router.delete("/offers/:id", authenticate, authorize("BUYER"), cancelOffer);

export { router as buyerRoutes };
