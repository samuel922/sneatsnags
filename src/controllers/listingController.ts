import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import { logger } from "../utils/logger";
import { listingService } from "../services/listingService";
import { getPaginationParams, createPaginationResult } from "../utils/pagination";
import { AuthenticatedRequest } from "../types/auth";

export const listingController = {
  // Get all listings (public)
  getListings: async (req: Request, res: Response) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { eventId, sectionId, minPrice, maxPrice, status, city, state } = req.query;

      const result = await listingService.getListings({
        skip,
        take: limit,
        eventId: eventId as string,
        sectionId: sectionId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as string,
        city: city as string,
        state: state as string,
      });

      const paginatedResult = createPaginationResult(
        result.listings,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Listings retrieved"));
    } catch (error) {
      logger.error("Get listings error:", error);
      res.status(500).json(errorResponse("Failed to retrieve listings"));
    }
  },

  // Get single listing by ID (public)
  getListingById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const listing = await listingService.getListingById(id);
      
      if (!listing) {
        return res.status(404).json(errorResponse("Listing not found"));
      }

      res.json(successResponse(listing, "Listing retrieved"));
    } catch (error) {
      logger.error("Get listing by ID error:", error);
      res.status(500).json(errorResponse("Failed to retrieve listing"));
    }
  },

  // Get listings by event (public)
  getListingsByEvent: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { sectionId, minPrice, maxPrice, status } = req.query;

      const result = await listingService.getListingsByEvent(eventId, {
        skip,
        take: limit,
        sectionId: sectionId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as string,
      });

      const paginatedResult = createPaginationResult(
        result.listings,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Event listings retrieved"));
    } catch (error) {
      logger.error("Get listings by event error:", error);
      res.status(500).json(errorResponse("Failed to retrieve event listings"));
    }
  },

  // Get listings by section (public)
  getListingsBySection: async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { minPrice, maxPrice, status } = req.query;

      const result = await listingService.getListingsBySection(sectionId, {
        skip,
        take: limit,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as string,
      });

      const paginatedResult = createPaginationResult(
        result.listings,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Section listings retrieved"));
    } catch (error) {
      logger.error("Get listings by section error:", error);
      res.status(500).json(errorResponse("Failed to retrieve section listings"));
    }
  },

  // Get listing statistics (public)
  getListingStats: async (req: Request, res: Response) => {
    try {
      const { eventId, sectionId } = req.query;
      const stats = await listingService.getListingStats({
        eventId: eventId as string,
        sectionId: sectionId as string,
      });
      res.json(successResponse(stats, "Listing statistics retrieved"));
    } catch (error) {
      logger.error("Get listing stats error:", error);
      res.status(500).json(errorResponse("Failed to retrieve listing statistics"));
    }
  },

  // Search listings (public)
  searchListings: async (req: Request, res: Response) => {
    try {
      const { q, eventId, minPrice, maxPrice, sectionId, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json(errorResponse("Search query is required"));
      }

      const listings = await listingService.searchListings({
        query: q as string,
        eventId: eventId as string,
        sectionId: sectionId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        limit: parseInt(limit as string),
      });

      res.json(successResponse(listings, "Search completed"));
    } catch (error) {
      logger.error("Search listings error:", error);
      res.status(500).json(errorResponse("Failed to search listings"));
    }
  },

  // Get recent listings (public)
  getRecentListings: async (req: Request, res: Response) => {
    try {
      const { limit = 10, eventId, city, state } = req.query;
      const listings = await listingService.getRecentListings({
        limit: parseInt(limit as string),
        eventId: eventId as string,
        city: city as string,
        state: state as string,
      });
      res.json(successResponse(listings, "Recent listings retrieved"));
    } catch (error) {
      logger.error("Get recent listings error:", error);
      res.status(500).json(errorResponse("Failed to retrieve recent listings"));
    }
  },

  // Get similar listings (public)
  getSimilarListings: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      
      const listings = await listingService.getSimilarListings(id, parseInt(limit as string));
      res.json(successResponse(listings, "Similar listings retrieved"));
    } catch (error) {
      logger.error("Get similar listings error:", error);
      res.status(500).json(errorResponse("Failed to retrieve similar listings"));
    }
  },

  // Create listing (sellers only)
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

  // Update listing (sellers only - own listings)
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

  // Delete listing (sellers only - own listings)
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

  // Upload ticket files (sellers only - own listings)
  uploadTicketFiles: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json(errorResponse("No files uploaded"));
      }

      const fileUrls = files.map(file => `/uploads/${file.filename}`);
      const listing = await listingService.addTicketFiles(id, sellerId, fileUrls);
      
      res.json(successResponse(listing, "Ticket files uploaded successfully"));
    } catch (error) {
      logger.error("Upload ticket files error:", error);
      res.status(500).json(errorResponse("Failed to upload ticket files"));
    }
  },

  // Mark listing as sold (sellers only - own listings)
  markAsSold: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      
      const listing = await listingService.markAsSold(id, sellerId);
      res.json(successResponse(listing, "Listing marked as sold"));
    } catch (error) {
      logger.error("Mark as sold error:", error);
      res.status(500).json(errorResponse("Failed to mark listing as sold"));
    }
  },

  // Get seller's listings (sellers only)
  getSellerListings: async (req: AuthenticatedRequest, res: Response) => {
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

      res.json(successResponse(paginatedResult, "Seller listings retrieved"));
    } catch (error) {
      logger.error("Get seller listings error:", error);
      res.status(500).json(errorResponse("Failed to retrieve seller listings"));
    }
  },
};