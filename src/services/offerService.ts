import { prisma } from "../utils/prisma";
import {
  CreateOfferRequest,
  UpdateOfferRequest,
  OfferSearchQuery,
} from "../types/offer";
import { PaginationResponse } from "../types/api";
import { logger } from "../utils/logger";

export class OfferService {
  async createOffer(buyerId: string, data: CreateOfferRequest) {
    // Validate event exists
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event || !event.isActive) {
      throw new Error("Event not found or inactive");
    }

    // Validate sections exist
    const sections = await prisma.section.findMany({
      where: {
        id: { in: data.sectionIds },
        eventId: data.eventId,
      },
    });

    if (sections.length !== data.sectionIds.length) {
      throw new Error("One or more sections not found");
    }

    const offer = await prisma.offer.create({
      data: {
        buyerId,
        eventId: data.eventId,
        maxPrice: data.maxPrice,
        quantity: data.quantity,
        message: data.message,
        expiresAt: data.expiresAt,
        sections: {
          create: data.sectionIds.map((sectionId) => ({ sectionId })),
        },
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
        sections: {
          include: {
            section: true,
          },
        },
      },
    });

    logger.info(`Offer created: ${offer.id} by user: ${buyerId}`);
    return offer;
  }

  async getOffers(query: OfferSearchQuery): Promise<PaginationResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      eventId,
      status,
      minPrice,
      maxPrice,
      buyerId,
    } = query;

    const offset = (page - 1) * limit;

    const where: any = {};

    if (eventId) where.eventId = eventId;
    if (status) where.status = status;
    if (buyerId) where.buyerId = buyerId;
    if (minPrice || maxPrice) {
      if (minPrice) where.maxPrice = { ...where.maxPrice, gte: minPrice };
      if (maxPrice) where.maxPrice = { ...where.maxPrice, lte: maxPrice };
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.offer.count({ where }),
    ]);

    return {
      data: offers,
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

  async getOfferById(offerId: string, userId?: string) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        sections: {
          include: {
            section: true,
          },
        },
        transaction: true,
      },
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    // Check if user can view this offer
    if (userId && offer.buyerId !== userId) {
      // Remove sensitive information for non-owners
      return {
        ...offer,
        buyer: {
          id: offer.buyer.id,
          firstName:
            offer.buyer.firstName.charAt(0) +
            "*".repeat(offer.buyer.firstName.length - 1),
          lastName:
            offer.buyer.lastName.charAt(0) +
            "*".repeat(offer.buyer.lastName.length - 1),
        },
      };
    }

    return offer;
  }

  async updateOffer(
    offerId: string,
    buyerId: string,
    data: UpdateOfferRequest
  ) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    if (offer.buyerId !== buyerId) {
      throw new Error("Unauthorized");
    }

    if (offer.status !== "ACTIVE") {
      throw new Error("Can only update active offers");
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
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
        sections: {
          include: {
            section: true,
          },
        },
      },
    });

    logger.info(`Offer updated: ${offerId} by user: ${buyerId}`);
    return updatedOffer;
  }

  async cancelOffer(offerId: string, buyerId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    if (offer.buyerId !== buyerId) {
      throw new Error("Unauthorized");
    }

    if (offer.status !== "ACTIVE") {
      throw new Error("Can only cancel active offers");
    }

    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "CANCELLED" },
    });

    logger.info(`Offer cancelled: ${offerId} by user: ${buyerId}`);
    return { message: "Offer cancelled successfully" };
  }

  async acceptOffer(offerId: string, sellerId: string, listingId: string) {
    return await prisma.$transaction(async (tx) => {
      // Get offer with validation
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: {
          buyer: true,
          event: true,
        },
      });

      if (!offer) {
        throw new Error("Offer not found");
      }

      if (offer.status !== "ACTIVE") {
        throw new Error("Offer is no longer active");
      }

      if (new Date() > offer.expiresAt) {
        throw new Error("Offer has expired");
      }

      // Get listing with validation
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        throw new Error("Listing not found");
      }

      if (listing.sellerId !== sellerId) {
        throw new Error("Unauthorized");
      }

      if (listing.status !== "AVAILABLE") {
        throw new Error("Listing is no longer available");
      }

      if (listing.eventId !== offer.eventId) {
        throw new Error("Listing and offer are for different events");
      }

      if (listing.quantity < offer.quantity) {
        throw new Error("Not enough tickets available");
      }

      // Update offer status
      const updatedOffer = await tx.offer.update({
        where: { id: offerId },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          acceptedBy: sellerId,
        },
      });

      // Update listing status
      await tx.listing.update({
        where: { id: listingId },
        data: { status: "SOLD" },
      });

      // Calculate fees
      const platformFeeRate = 0.1; // 10%
      const platformFee = Number(offer.maxPrice) * platformFeeRate;
      const sellerAmount = Number(offer.maxPrice) - platformFee;

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          buyerId: offer.buyerId,
          sellerId,
          offerId,
          listingId,
          eventId: offer.eventId,
          amount: offer.maxPrice,
          platformFee,
          sellerAmount,
          status: "PENDING",
        },
      });

      logger.info(`Offer accepted: ${offerId} by seller: ${sellerId}`);

      return {
        offer: updatedOffer,
        transaction,
      };
    });
  }
}
