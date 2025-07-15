import { Router } from "express";
import { eventControllerV2 } from "../controllers/eventController.v2";
import { authenticate } from "../middlewares/authenticate";
import { requireRole } from "../middlewares/requireRole";
import {
  validateEventCreation,
  validateEventUpdate,
  validateEventDeletion,
  validateEventSearch,
  validateEventId,
  validateEventRequest,
} from "../middlewares/eventValidation";
import { rateLimitMiddleware } from "../middlewares/rateLimit";

const router = Router();

// Apply base middleware to all routes
router.use(validateEventRequest);

// Public routes (no authentication required)
router.get(
  "/",
  rateLimitMiddleware({ windowMs: 60000, max: 100 }), // 100 requests per minute
  validateEventSearch,
  eventControllerV2.getEvents
);

router.get(
  "/search",
  rateLimitMiddleware({ windowMs: 60000, max: 50 }), // 50 searches per minute
  eventControllerV2.searchEvents
);

router.get(
  "/popular",
  rateLimitMiddleware({ windowMs: 60000, max: 30 }), // 30 requests per minute
  eventControllerV2.getPopularEvents
);

router.get(
  "/upcoming",
  rateLimitMiddleware({ windowMs: 60000, max: 30 }), // 30 requests per minute
  eventControllerV2.getUpcomingEvents
);

router.get(
  "/:id",
  rateLimitMiddleware({ windowMs: 60000, max: 200 }), // 200 requests per minute
  validateEventId,
  eventControllerV2.getEventById
);

router.get(
  "/:id/stats",
  rateLimitMiddleware({ windowMs: 60000, max: 100 }), // 100 requests per minute
  validateEventId,
  eventControllerV2.getEventStats
);

// Admin-only routes (require authentication and admin role)
router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  rateLimitMiddleware({ windowMs: 60000, max: 10 }), // 10 creations per minute
  validateEventCreation,
  eventControllerV2.createEvent
);

router.put(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  rateLimitMiddleware({ windowMs: 60000, max: 20 }), // 20 updates per minute
  validateEventUpdate,
  eventControllerV2.updateEvent
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  rateLimitMiddleware({ windowMs: 60000, max: 5 }), // 5 deletions per minute
  validateEventDeletion,
  eventControllerV2.deleteEvent
);

// Health check endpoint
router.get(
  "/health/check",
  rateLimitMiddleware({ windowMs: 60000, max: 10 }), // 10 health checks per minute
  eventControllerV2.healthCheck
);

export { router as eventRoutesV2 };