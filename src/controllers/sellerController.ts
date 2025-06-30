import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import { logger } from "../utils/logger";
import { listingService } from "../services/listingService";
import { transactionService } from "../services/transactionService";
import { getPaginationParams, createPaginationResult } from "../utils/pagination";
import { AuthenticatedRequest } from "../types/auth";

export const sellerController = {
  // Get seller dashboard stats
  getDashboard: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const stats = await listingService.getSellerStats(sellerId);
      res.json(successResponse(stats, "Dashboard stats retrieved"));
    } catch (error) {
      logger.error("Get seller dashboard error:", error);
      res.status(500).json(errorResponse("Failed to retrieve dashboard"));
    }
  },

  // Get seller's listings
  getListings: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status, eventId } = req.query;

      const result = await listingService.getSellerListings(sellerId, {
        skip,
        take: limit,
        status: status as string,
        eventId: eventId as string,
      });

      const paginatedResult = createPaginationResult(
        result.listings,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Listings retrieved"));
    } catch (error) {
      logger.error("Get seller listings error:", error);
      res.status(500).json(errorResponse("Failed to retrieve listings"));
    }
  },

  // Create a new listing
  createListing: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const listingData = { ...req.body, sellerId };
      
      const listing = await listingService.createListing(sellerId, listingData);
      res.status(201).json(successResponse(listing, "Listing created successfully"));
    } catch (error) {
      logger.error("Create listing error:", error);
      res.status(500).json(errorResponse("Failed to create listing"));
    }
  },

  // Update a listing
  updateListing: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      
      const listing = await listingService.updateListing(id, sellerId, req.body);
      res.json(successResponse(listing, "Listing updated successfully"));
    } catch (error) {
      logger.error("Update listing error:", error);
      res.status(500).json(errorResponse("Failed to update listing"));
    }
  },

  // Delete a listing
  deleteListing: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      
      await listingService.deleteListing(id, sellerId);
      res.json(successResponse(null, "Listing deleted successfully"));
    } catch (error) {
      logger.error("Delete listing error:", error);
      res.status(500).json(errorResponse("Failed to delete listing"));
    }
  },

  // Get seller's transactions
  getTransactions: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status } = req.query;

      const result = await transactionService.getSellerTransactions(sellerId, {
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

      res.json(successResponse(paginatedResult, "Transactions retrieved"));
    } catch (error) {
      logger.error("Get seller transactions error:", error);
      res.status(500).json(errorResponse("Failed to retrieve transactions"));
    }
  },

  // Accept an offer
  acceptOffer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { offerId } = req.params;
      const { listingId } = req.body;
      
      const transaction = await transactionService.acceptOffer(offerId, listingId, sellerId);
      res.json(successResponse(transaction, "Offer accepted successfully"));
    } catch (error) {
      logger.error("Accept offer error:", error);
      res.status(500).json(errorResponse("Failed to accept offer"));
    }
  },

  // Mark tickets as delivered
  markTicketsDelivered: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { transactionId } = req.params;
      
      const transaction = await transactionService.markTicketsDelivered(transactionId, sellerId);
      res.json(successResponse(transaction, "Tickets marked as delivered"));
    } catch (error) {
      logger.error("Mark tickets delivered error:", error);
      res.status(500).json(errorResponse("Failed to mark tickets as delivered"));
    }
  },

  // Upload ticket files
  uploadTicketFiles: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { listingId } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json(errorResponse("No files uploaded"));
      }

      const fileUrls = files.map(file => `/uploads/${file.filename}`);
      const listing = await listingService.addTicketFiles(listingId, sellerId, fileUrls);
      
      res.json(successResponse(listing, "Ticket files uploaded successfully"));
    } catch (error) {
      logger.error("Upload ticket files error:", error);
      res.status(500).json(errorResponse("Failed to upload ticket files"));
    }
  },

  // Get available offers for seller
  getAvailableOffers: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { eventId, minPrice, maxPrice } = req.query;

      const result = await listingService.getAvailableOffers({
        skip,
        take: limit,
        eventId: eventId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      });

      const paginatedResult = createPaginationResult(
        result.offers,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Available offers retrieved"));
    } catch (error) {
      logger.error("Get available offers error:", error);
      res.status(500).json(errorResponse("Failed to retrieve offers"));
    }
  },
};