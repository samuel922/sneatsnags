import { Router } from "express";
import { webhookController } from "../controllers/webhookController";

const router = Router();

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     summary: Handle Stripe webhooks
 *     tags: [Webhooks]
 *     description: Endpoint for Stripe webhook events
 *     requestBody:
 *       description: Stripe webhook payload
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *       400:
 *         description: Webhook processing failed
 */
router.post("/stripe", webhookController.handleStripeWebhook);

export default router;