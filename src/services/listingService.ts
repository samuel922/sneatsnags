import { prisma } from "../utils/prisma";
import {
  CreateListingRequest,
  UpdateListingRequest,
  ListingSearchQuery,
} from "../types/listing";
import { PaginationResponse } from "../types/api";
import { logger } from "../utils/logger";

export class ListingService {
  async createListing(sellerId: string, data: CreateListingRequest) {
    // Validate event and section
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
      include: { event: true },
    });

    if (!section || section.eventId !== data.eventId) {
      throw new Error("Invalid event or section");
    }

    if (!section.event.isActive) {
      throw new Error("Event is not active");
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId,
        eventId: data.eventId,
        sectionId: data.sectionId,
        row: data.row,
        seats: data.seats,
        price: data.price,
        quantity: data.quantity,
        notes: data.notes,
        ticketFiles: data.ticketFiles || [],
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            venue: true,
            eventDate: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Listing created: ${listing.id} by user: ${sellerId}`);
    return listing;
  }

  async getListings(
    query: ListingSearchQuery
  ): Promise<PaginationResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      eventId,
      sectionId,
      status,
      minPrice,
      maxPrice,
      sellerId,
    } = query;

    const offset = (page - 1) * limit;

    const where: any = {};

    if (eventId) where.eventId = eventId;
    if (sectionId) where.sectionId = sectionId;
    if (status) where.status = status;
    if (sellerId) where.sellerId = sellerId;
    if (minPrice || maxPrice) {
      if (minPrice) where.price = { ...where.price, gte: minPrice };
      if (maxPrice) where.price = { ...where.price, lte: maxPrice };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              venue: true,
              eventDate: true,
            },
          },
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getListingById(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            venue: true,
            address: true,
            city: true,
            state: true,
            eventDate: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        transaction: true,
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }
    return listing;
  }

  async updateListing(
    listingId: string,
    sellerId: string,
    data: UpdateListingRequest
  ) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId !== sellerId) {
      throw new Error("Unauthorized");
    }

    if (listing.status === "SOLD") {
      throw new Error("Cannot update sold listing");
    }

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            venue: true,
            eventDate: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Listing updated: ${listingId} by user: ${sellerId}`);
    return updatedListing;
  }

  async deleteListing(listingId: string, sellerId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId !== sellerId) {
      throw new Error("Unauthorized");
    }

    if (listing.status === "SOLD") {
      throw new Error("Cannot delete sold listing");
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "CANCELLED" },
    });

    logger.info(`Listing deleted: ${listingId} by user: ${sellerId}`);
    return { message: "Listing deleted successfully" };
  }

  async getMatchingOffers(listingId: string, sellerId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { section: true },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId !== sellerId) {
      throw new Error("Unauthorized");
    }

    // Find matching offers
    const offers = await prisma.offer.findMany({
      where: {
        eventId: listing.eventId,
        status: "ACTIVE",
        maxPrice: { gte: listing.price },
        quantity: { lte: listing.quantity },
        expiresAt: { gt: new Date() },
        sections: {
          some: {
            sectionId: listing.sectionId,
          },
        },
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: {
          include: {
            section: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { maxPrice: "desc" },
    });

    return offers;
  }
}
