import { Router } from "express";
import { listingController } from "../controllers/listingController";
import { authenticate } from "../middlewares/auth";
import { validateRole } from "../middlewares/validation";
import { upload } from "../middlewares/upload";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Get all listings with filtering and pagination
 *     tags: [Listings]
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
 *         name: sectionId
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
 *         description: Listings retrieved successfully
 */
router.get("/", listingController.getListings);

/**
 * @swagger
 * /api/listings/search:
 *   get:
 *     summary: Search listings
 *     tags: [Listings]
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
 *         name: sectionId
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
router.get("/search", listingController.searchListings);

/**
 * @swagger
 * /api/listings/recent:
 *   get:
 *     summary: Get recent listings
 *     tags: [Listings]
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
 *         description: Recent listings retrieved successfully
 */
router.get("/recent", listingController.getRecentListings);

/**
 * @swagger
 * /api/listings/stats:
 *   get:
 *     summary: Get listing statistics
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing statistics retrieved successfully
 */
router.get("/stats", listingController.getListingStats);

/**
 * @swagger
 * /api/listings/events/{eventId}:
 *   get:
 *     summary: Get listings by event
 *     tags: [Listings]
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
 *         name: sectionId
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
 *     responses:
 *       200:
 *         description: Event listings retrieved successfully
 */
router.get("/events/:eventId", listingController.getListingsByEvent);

/**
 * @swagger
 * /api/listings/sections/{sectionId}:
 *   get:
 *     summary: Get listings by section
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: sectionId
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
 *         description: Section listings retrieved successfully
 */
router.get("/sections/:sectionId", listingController.getListingsBySection);

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing retrieved successfully
 *       404:
 *         description: Listing not found
 */
router.get("/:id", listingController.getListingById);

/**
 * @swagger
 * /api/listings/{id}/similar:
 *   get:
 *     summary: Get similar listings
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Similar listings retrieved successfully
 */
router.get("/:id/similar", listingController.getSimilarListings);

// Authenticated routes (seller actions)
router.use(authenticate);

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a new listing (Sellers only)
 *     tags: [Listings]
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
 *               - sectionId
 *               - price
 *               - seats
 *             properties:
 *               eventId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *               row:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Listing created successfully
 */
router.post("/", validateRole([UserRole.SELLER, UserRole.ADMIN]), listingController.createListing);

/**
 * @swagger
 * /api/listings/my-listings:
 *   get:
 *     summary: Get current user's listings (Sellers only)
 *     tags: [Listings]
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
 *         description: Seller listings retrieved successfully
 */
router.get("/my-listings", validateRole([UserRole.SELLER, UserRole.ADMIN]), listingController.getSellerListings);

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Update a listing (Sellers only - own listings)
 *     tags: [Listings]
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
 *         description: Listing updated successfully
 */
router.put("/:id", validateRole([UserRole.SELLER, UserRole.ADMIN]), listingController.updateListing);

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Delete a listing (Sellers only - own listings)
 *     tags: [Listings]
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
 *         description: Listing deleted successfully
 */
router.delete("/:id", validateRole([UserRole.SELLER, UserRole.ADMIN]), listingController.deleteListing);

/**
 * @swagger
 * /api/listings/{id}/upload-tickets:
 *   post:
 *     summary: Upload ticket files for a listing (Sellers only)
 *     tags: [Listings]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tickets:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Ticket files uploaded successfully
 */
router.post("/:id/upload-tickets", validateRole([UserRole.SELLER, UserRole.ADMIN]), upload.array("tickets", 10), listingController.uploadTicketFiles);

/**
 * @swagger
 * /api/listings/{id}/mark-sold:
 *   post:
 *     summary: Mark listing as sold (Sellers only)
 *     tags: [Listings]
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
 *         description: Listing marked as sold successfully
 */
router.post("/:id/mark-sold", validateRole([UserRole.SELLER, UserRole.ADMIN]), listingController.markAsSold);

export { router as listingRoutes };