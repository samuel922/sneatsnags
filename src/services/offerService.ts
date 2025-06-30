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

  async getOffersPublic(params: {
    skip: number;
    take: number;
    eventId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    city?: string;
    state?: string;
  }) {
    const { skip, take, eventId, minPrice, maxPrice, status, city, state } = params;
    
    const where: any = {};
    
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;
    
    if (minPrice || maxPrice) {
      where.maxPrice = {};
      if (minPrice) where.maxPrice.gte = minPrice;
      if (maxPrice) where.maxPrice.lte = maxPrice;
    }
    
    if (city || state) {
      where.event = {};
      if (city) where.event.city = { contains: city, mode: "insensitive" };
      if (state) where.event.state = { contains: state, mode: "insensitive" };
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          event: true,
          sections: {
            include: {
              section: true,
            },
          },
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { offers, total };
  }

  async getBuyerOffers(buyerId: string, params: {
    skip: number;
    take: number;
    status?: string;
    eventId?: string;
  }) {
    const { skip, take, status, eventId } = params;
    
    const where: any = { buyerId };
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          event: true,
          sections: {
            include: {
              section: true,
            },
          },
          transaction: true,
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { offers, total };
  }

  async getOffersByEvent(eventId: string, params: {
    skip: number;
    take: number;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }) {
    const { skip, take, minPrice, maxPrice, status } = params;
    
    const where: any = { eventId };
    if (status) where.status = status;
    
    if (minPrice || maxPrice) {
      where.maxPrice = {};
      if (minPrice) where.maxPrice.gte = minPrice;
      if (maxPrice) where.maxPrice.lte = maxPrice;
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take,
        orderBy: { maxPrice: "desc" },
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          event: true,
          sections: {
            include: {
              section: true,
            },
          },
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { offers, total };
  }

  async extendOffer(offerId: string, buyerId: string, newExpiryDate: Date) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId, buyerId },
    });

    if (!offer) {
      throw new Error("Offer not found or not owned by buyer");
    }

    if (offer.status !== "ACTIVE") {
      throw new Error("Can only extend active offers");
    }

    return await prisma.offer.update({
      where: { id: offerId },
      data: { expiresAt: newExpiryDate },
    });
  }

  async getOfferStats(eventId?: string) {
    const where: any = {};
    if (eventId) where.eventId = eventId;

    const [totalOffers, activeOffers, acceptedOffers, avgPrice] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.offer.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.offer.count({ where: { ...where, status: "ACCEPTED" } }),
      prisma.offer.aggregate({
        where,
        _avg: { maxPrice: true },
      }),
    ]);

    return {
      totalOffers,
      activeOffers,
      acceptedOffers,
      averagePrice: avgPrice._avg.maxPrice || 0,
    };
  }

  async searchOffers(params: {
    query: string;
    eventId?: string;
    minPrice?: number;
    maxPrice?: number;
    limit: number;
  }) {
    const { query, eventId, minPrice, maxPrice, limit } = params;
    
    const where: any = {
      status: "ACTIVE",
      expiresAt: { gte: new Date() },
      OR: [
        { message: { contains: query, mode: "insensitive" } },
        { event: { name: { contains: query, mode: "insensitive" } } },
      ],
    };
    
    if (eventId) where.eventId = eventId;
    
    if (minPrice || maxPrice) {
      where.maxPrice = {};
      if (minPrice) where.maxPrice.gte = minPrice;
      if (maxPrice) where.maxPrice.lte = maxPrice;
    }

    return await prisma.offer.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        event: true,
        sections: {
          include: {
            section: true,
          },
        },
      },
    });
  }

  async getRecentOffers(params: {
    limit: number;
    eventId?: string;
  }) {
    const { limit, eventId } = params;
    
    const where: any = {
      status: "ACTIVE",
      expiresAt: { gte: new Date() },
    };
    
    if (eventId) where.eventId = eventId;

    return await prisma.offer.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        event: true,
        sections: {
          include: {
            section: true,
          },
        },
      },
    });
  }
}

export const offerService = new OfferService();