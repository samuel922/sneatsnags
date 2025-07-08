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

      // Validate price range
      if (minPrice && maxPrice && parseFloat(minPrice as string) > parseFloat(maxPrice as string)) {
        return res.status(400).json(errorResponse("Minimum price cannot be greater than maximum price"));
      }

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

      res.json(successResponse(paginatedResult, "Listings retrieved successfully"));
    } catch (error: any) {
      logger.error("Get listings error:", error);
      const message = error.message?.includes("database") 
        ? "We're experiencing technical difficulties. Please try again later."
        : "Unable to retrieve listings at this time. Please try again.";
      res.status(500).json(errorResponse(message));
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
      
      if (!q || (q as string).trim().length === 0) {
        return res.status(400).json(errorResponse("Please enter a search term"));
      }

      if ((q as string).trim().length < 2) {
        return res.status(400).json(errorResponse("Search term must be at least 2 characters long"));
      }

      // Validate price range
      if (minPrice && maxPrice && parseFloat(minPrice as string) > parseFloat(maxPrice as string)) {
        return res.status(400).json(errorResponse("Minimum price cannot be greater than maximum price"));
      }

      const listings = await listingService.searchListings({
        query: q as string,
        eventId: eventId as string,
        sectionId: sectionId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        limit: parseInt(limit as string),
      });

      const message = listings.length > 0 
        ? `Found ${listings.length} listing${listings.length === 1 ? '' : 's'} matching your search`
        : "No listings found matching your search criteria";

      res.json(successResponse(listings, message));
    } catch (error: any) {
      logger.error("Search listings error:", error);
      const message = error.message?.includes("database") 
        ? "Search is temporarily unavailable. Please try again later."
        : "Unable to search listings at this time. Please try again.";
      res.status(500).json(errorResponse(message));
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
      
      // Basic validation
      if (!listingData.eventId || !listingData.sectionId) {
        return res.status(400).json(errorResponse("Event and section are required"));
      }
      
      if (!listingData.price || listingData.price <= 0) {
        return res.status(400).json(errorResponse("Valid price is required"));
      }
      
      if (!listingData.quantity || listingData.quantity <= 0) {
        return res.status(400).json(errorResponse("Valid quantity is required"));
      }
      
      const listing = await listingService.createListing(sellerId, listingData);
      res.status(201).json(successResponse(listing, "Listing created successfully"));
    } catch (error: any) {
      logger.error("Create listing error:", error);
      
      let message = "Unable to create listing. Please try again.";
      let statusCode = 500;
      
      if (error.message?.includes("Invalid event or section")) {
        message = "The selected event or section is not valid. Please check your selection.";
        statusCode = 400;
      } else if (error.message?.includes("Event is not active")) {
        message = "This event is no longer accepting new listings.";
        statusCode = 400;
      } else if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        message = "You already have a listing for these seats. Please update your existing listing instead.";
        statusCode = 409;
      }
      
      res.status(statusCode).json(errorResponse(message));
    }
  },

  // Update listing (sellers only - own listings)
  updateListing: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json(errorResponse("Listing ID is required"));
      }
      
      const listing = await listingService.updateListing(id, sellerId, req.body);
      res.json(successResponse(listing, "Listing updated successfully"));
    } catch (error: any) {
      logger.error("Update listing error:", error);
      
      let message = "Unable to update listing. Please try again.";
      let statusCode = 500;
      
      if (error.message?.includes("not found") || error.message?.includes("Not found")) {
        message = "Listing not found or you don't have permission to update it.";
        statusCode = 404;
      } else if (error.message?.includes("sold")) {
        message = "Cannot update a listing that has already been sold.";
        statusCode = 400;
      } else if (error.message?.includes("unauthorized")) {
        message = "You can only update your own listings.";
        statusCode = 403;
      }
      
      res.status(statusCode).json(errorResponse(message));
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
      
      if (!id) {
        return res.status(400).json(errorResponse("Listing ID is required"));
      }
      
      if (!files || files.length === 0) {
        return res.status(400).json(errorResponse("Please select at least one ticket file to upload"));
      }

      // Validate file types and sizes
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json(errorResponse("Only JPEG, PNG, and PDF files are allowed"));
        }
        if (file.size > maxSize) {
          return res.status(400).json(errorResponse("Files must be smaller than 10MB"));
        }
      }

      const fileUrls = files.map(file => `/uploads/${file.filename}`);
      const listing = await listingService.addTicketFiles(id, sellerId, fileUrls);
      
      res.json(successResponse(listing, `${files.length} ticket file${files.length === 1 ? '' : 's'} uploaded successfully`));
    } catch (error: any) {
      logger.error("Upload ticket files error:", error);
      
      let message = "Unable to upload ticket files. Please try again.";
      let statusCode = 500;
      
      if (error.message?.includes("not found") || error.message?.includes("Not found")) {
        message = "Listing not found or you don't have permission to upload files for it.";
        statusCode = 404;
      } else if (error.message?.includes("unauthorized")) {
        message = "You can only upload files for your own listings.";
        statusCode = 403;
      } else if (error.message?.includes("sold")) {
        message = "Cannot upload files for a listing that has already been sold.";
        statusCode = 400;
      }
      
      res.status(statusCode).json(errorResponse(message));
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