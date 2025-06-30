import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import { logger } from "../utils/logger";
import { offerService } from "../services/offerService";
import { getPaginationParams, createPaginationResult } from "../utils/pagination";
import { AuthenticatedRequest } from "../types/auth";

export const offerController = {
  // Get all offers (public - for sellers to see)
  getOffers: async (req: Request, res: Response) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { eventId, minPrice, maxPrice, status, city, state } = req.query;

      const result = await offerService.getOffersPublic({
        skip,
        take: limit,
        eventId: eventId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as any,
        city: city as string,
        state: state as string,
      });

      const paginatedResult = createPaginationResult(
        result.offers,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Offers retrieved"));
    } catch (error) {
      logger.error("Get offers error:", error);
      res.status(500).json(errorResponse("Failed to retrieve offers"));
    }
  },

  // Get single offer by ID (public)
  getOfferById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const offer = await offerService.getOfferById(id, undefined);
      
      if (!offer) {
        return res.status(404).json(errorResponse("Offer not found"));
      }

      res.json(successResponse(offer, "Offer retrieved"));
    } catch (error) {
      logger.error("Get offer by ID error:", error);
      res.status(500).json(errorResponse("Failed to retrieve offer"));
    }
  },

  // Create offer (buyers only)
  createOffer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const buyerId = req.user!.id;
      const offerData = { ...req.body, buyerId };
      
      const offer = await offerService.createOffer(buyerId, offerData);
      res.status(201).json(successResponse(offer, "Offer created successfully"));
    } catch (error) {
      logger.error("Create offer error:", error);
      res.status(500).json(errorResponse("Failed to create offer"));
    }
  },

  // Update offer (buyers only - own offers)
  updateOffer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const buyerId = req.user!.id;
      const { id } = req.params;
      
      const offer = await offerService.updateOffer(id, buyerId, req.body);
      res.json(successResponse(offer, "Offer updated successfully"));
    } catch (error) {
      logger.error("Update offer error:", error);
      res.status(500).json(errorResponse("Failed to update offer"));
    }
  },

  // Cancel offer (buyers only - own offers)
  cancelOffer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const buyerId = req.user!.id;
      const { id } = req.params;
      
      const offer = await offerService.cancelOffer(id, buyerId);
      res.json(successResponse(offer, "Offer cancelled successfully"));
    } catch (error) {
      logger.error("Cancel offer error:", error);
      res.status(500).json(errorResponse("Failed to cancel offer"));
    }
  },

  // Get buyer's offers (buyers only)
  getBuyerOffers: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const buyerId = req.user!.id;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status, eventId } = req.query;

      const result = await offerService.getBuyerOffers(buyerId, {
        skip,
        take: limit,
        status: status as string,
        eventId: eventId as string,
      });

      const paginatedResult = createPaginationResult(
        result.offers,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Buyer offers retrieved"));
    } catch (error) {
      logger.error("Get buyer offers error:", error);
      res.status(500).json(errorResponse("Failed to retrieve buyer offers"));
    }
  },

  // Get offers by event (public)
  getOffersByEvent: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { minPrice, maxPrice, status } = req.query;

      const result = await offerService.getOffersByEvent(eventId, {
        skip,
        take: limit,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as string,
      });

      const paginatedResult = createPaginationResult(
        result.offers,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Event offers retrieved"));
    } catch (error) {
      logger.error("Get offers by event error:", error);
      res.status(500).json(errorResponse("Failed to retrieve event offers"));
    }
  },

  // Extend offer expiry (buyers only - own offers)
  extendOffer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const buyerId = req.user!.id;
      const { id } = req.params;
      const { expiresAt } = req.body;
      
      if (!expiresAt) {
        return res.status(400).json(errorResponse("New expiry date is required"));
      }

      const offer = await offerService.extendOffer(id, buyerId, new Date(expiresAt));
      res.json(successResponse(offer, "Offer extended successfully"));
    } catch (error) {
      logger.error("Extend offer error:", error);
      res.status(500).json(errorResponse("Failed to extend offer"));
    }
  },

  // Get offer statistics (public)
  getOfferStats: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.query;
      const stats = await offerService.getOfferStats(eventId as string);
      res.json(successResponse(stats, "Offer statistics retrieved"));
    } catch (error) {
      logger.error("Get offer stats error:", error);
      res.status(500).json(errorResponse("Failed to retrieve offer statistics"));
    }
  },

  // Search offers (public)
  searchOffers: async (req: Request, res: Response) => {
    try {
      const { q, eventId, minPrice, maxPrice, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json(errorResponse("Search query is required"));
      }

      const offers = await offerService.searchOffers({
        query: q as string,
        eventId: eventId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        limit: parseInt(limit as string),
      });

      res.json(successResponse(offers, "Search completed"));
    } catch (error) {
      logger.error("Search offers error:", error);
      res.status(500).json(errorResponse("Failed to search offers"));
    }
  },

  // Get recent offers (public)
  getRecentOffers: async (req: Request, res: Response) => {
    try {
      const { limit = 10, eventId } = req.query;
      const offers = await offerService.getRecentOffers({
        limit: parseInt(limit as string),
        eventId: eventId as string,
      });
      res.json(successResponse(offers, "Recent offers retrieved"));
    } catch (error) {
      logger.error("Get recent offers error:", error);
      res.status(500).json(errorResponse("Failed to retrieve recent offers"));
    }
  },
};