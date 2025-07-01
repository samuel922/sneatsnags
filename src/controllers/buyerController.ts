import { Request, Response, NextFunction } from "express";
import { OfferService } from "../services/offerService";
import { EventService } from "../services/eventService";
import { BuyerService } from "../services/buyerService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const offerService = new OfferService();
const eventService = new EventService();
const buyerService = new BuyerService(prisma);

// Validation schemas
const createOfferSchema = z
  .object({
    eventId: z.string().cuid(),
    sectionIds: z.array(z.string().cuid()).min(1),
    maxPrice: z.number().positive(),
    quantity: z.number().int().positive(),
    message: z.string().optional(),
    expiresAt: z.string().datetime(),
  })
  .transform((data) => ({
    ...data,
    expiresAt: new Date(data.expiresAt),
  }));

const updateOfferSchema = z
  .object({
    maxPrice: z.number().positive().optional(),
    message: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .transform((data) => ({
    ...data,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
  }));

export const createOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user!.id;
    const validatedData = createOfferSchema.parse(req.body);

    const offer = await offerService.createOffer(buyerId, validatedData);
    res.status(201).json({
      success: true,
      data: offer,
      message: "Offer created successfully",
    });
  } catch (error: any) {
    logger.error("Create offer error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getMyOffers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user!.id;
    const query = {
      ...req.query,
      buyerId,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const offers = await offerService.getOffers(query);
    res.json({
      success: true,
      data: offers.data,
      pagination: offers.pagination,
    });
  } catch (error: any) {
    logger.error("Get my offers error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await offerService.getOfferById(offerId, userId);
    res.json({ success: true, data: offer });
  } catch (error: any) {
    logger.error("Get offer error:", error);
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offerId } = req.params;
    const buyerId = req.user!.id;
    const validatedData = updateOfferSchema.parse(req.body);

    const offer = await offerService.updateOffer(
      offerId,
      buyerId,
      validatedData
    );
    res.json({
      success: true,
      data: offer,
      message: "Offer updated successfully",
    });
  } catch (error: any) {
    logger.error("Update offer error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

export const cancelOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offerId } = req.params;
    const buyerId = req.user!.id;

    const result = await offerService.cancelOffer(offerId, buyerId);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("Cancel offer error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const searchEvents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      ...req.query,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const events = await eventService.getEvents(query);
    res.json({
      success: true,
      data: events.data,
      pagination: events.pagination,
    });
  } catch (error: any) {
    logger.error("Search events error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const event = await eventService.getEventById(eventId);
    res.json({ success: true, data: event });
  } catch (error: any) {
    logger.error("Get event error:", error);
    res.status(404).json({ success: false, error: error.message });
  }
};

export const getEventOffers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const query = {
      ...req.query,
      eventId,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const offers = await offerService.getOffers(query);
    res.json({
      success: true,
      data: offers.data,
      pagination: offers.pagination,
    });
  } catch (error: any) {
    logger.error("Get event offers error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getBuyerDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user!.id;

    // Get recent offers
    const recentOffers = await offerService.getOffers({
      buyerId,
      page: 1,
      limit: 5,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    // Get active offers count
    const activeOffers = await offerService.getOffers({
      buyerId,
      status: "ACTIVE",
      page: 1,
      limit: 1,
    });

    // Get accepted offers count
    const acceptedOffers = await offerService.getOffers({
      buyerId,
      status: "ACCEPTED",
      page: 1,
      limit: 1,
    });

    // Get upcoming events
    const upcomingEvents = await eventService.getEvents({
      dateFrom: new Date().toISOString(),
      page: 1,
      limit: 10,
      sortBy: "eventDate",
      sortOrder: "asc",
    });

    const dashboard = {
      recentOffers: recentOffers.data,
      upcomingEvents: upcomingEvents.data,
      stats: {
        activeOffers: activeOffers.pagination.total,
        acceptedOffers: acceptedOffers.pagination.total,
        totalOffers: recentOffers.pagination.total,
      },
    };

    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    logger.error("Get buyer dashboard error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getBuyerStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user!.id;
    const stats = await buyerService.getBuyerStats(buyerId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error("Get buyer stats error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const searchTickets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      ...req.query,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    };

    const tickets = await buyerService.searchAvailableTickets(query);
    res.json({
      success: true,
      data: tickets.data,
      pagination: tickets.pagination,
    });
  } catch (error: any) {
    logger.error("Search tickets error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getBuyerTransactions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user!.id;
    const query = {
      ...req.query,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const transactions = await buyerService.getBuyerTransactions(buyerId, query);
    res.json({
      success: true,
      data: transactions.data,
      pagination: transactions.pagination,
    });
  } catch (error: any) {
    logger.error("Get buyer transactions error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};
