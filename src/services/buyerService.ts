import { PrismaClient, Prisma } from "@prisma/client";
import { CreateOfferDTO, UpdateOfferDTO, OfferResponse } from "../types/buyer";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";
import type { PaginationResponse } from "../types/api";

export class BuyerService {
  constructor(private prisma: PrismaClient) {}

  private mapOffer(
    offer: Prisma.OfferGetPayload<{
      include: { sections: { select: { sectionId: true } } };
    }>
  ): OfferResponse {
    return {
      id: offer.id,
      eventId: offer.eventId,
      buyerId: offer.buyerId,
      maxPrice: Number(offer.maxPrice),
      quantity: offer.quantity,
      message: offer.message,
      status: offer.status,
      expiresAt: offer.expiresAt,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      sectionIds: offer.sections.map((s) => s.sectionId),
    };
  }

  async createOffer(
    buyerId: string,
    data: CreateOfferDTO
  ): Promise<OfferResponse> {
    const offer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.offer.create({
        data: {
          buyerId,
          eventId: data.eventId,
          maxPrice: data.maxPrice,
          quantity: data.quantity,
          message: data.message,
          expiresAt: data.expiresAt,
        },
      });

      if (data.sectionIds && data.sectionIds.length) {
        const sections = data.sectionIds.map((sectionId) => ({
          offerId: created.id,
          sectionId,
        }));
        await tx.offerSection.createMany({ data: sections });
      }

      return created;
    });

    const sections = await this.prisma.offerSection.findMany({
      where: { offerId: offer.id },
      select: { sectionId: true },
    });

    return this.mapOffer({ ...offer, sections });
  }

  async listOffers(
    buyerId: string,
    query: any
  ): Promise<PaginationResponse<OfferResponse>> {
    const { page, limit, skip } = getPaginationParams(query);

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where: { buyerId },
        include: { sections: { select: { sectionId: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where: { buyerId } }),
    ]);

    const mapped = offers.map((offer) => this.mapOffer(offer));

    return createPaginationResult(mapped, total, page, limit);
  }

  async getOfferById(buyerId: string, offerId: string): Promise<OfferResponse> {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, buyerId },
      include: { sections: { select: { sectionId: true } } },
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    return this.mapOffer(offer);
  }

  async updateOffer(
    buyerId: string,
    offerId: string,
    data: UpdateOfferDTO
  ): Promise<OfferResponse> {
    const offer = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.offer.update({
        where: { id: offerId, buyerId },
        data: {
          maxPrice: data.maxPrice,
          quantity: data.quantity,
          message: data.message,
          expiresAt: data.expiresAt,
          updatedAt: new Date(),
        },
      });

      if (data.sectionIds) {
        await tx.offerSection.deleteMany({ where: { offerId } });
        const sections = data.sectionIds.map((sectionId) => ({
          offerId,
          sectionId,
        }));
        if (sections.length) {
          await tx.offerSection.createMany({ data: sections });
        }
      }

      return updated;
    });

    const sections = await this.prisma.offerSection.findMany({
      where: { offerId: offer.id },
      select: { sectionId: true },
    });

    return this.mapOffer({ ...offer, sections });
  }

  async cancelOffer(buyerId: string, offerId: string): Promise<OfferResponse> {
    const offer = await this.prisma.offer.update({
      where: { id: offerId, buyerId },
      data: { status: "CANCELLED" },
      include: { sections: { select: { sectionId: true } } },
    });

    return this.mapOffer(offer);
  }

  async getBuyerStats(buyerId: string): Promise<{
    totalOffers: number;
    activeOffers: number;
    acceptedOffers: number;
    totalSpent: number;
    averageOfferPrice: number;
  }> {
    const [totalOffers, activeOffers, acceptedOffers, transactions] = await Promise.all([
      this.prisma.offer.count({ where: { buyerId } }),
      this.prisma.offer.count({ where: { buyerId, status: "ACTIVE" } }),
      this.prisma.offer.count({ where: { buyerId, status: "ACCEPTED" } }),
      this.prisma.transaction.findMany({
        where: { buyerId, status: "COMPLETED" },
        select: { amount: true }
      })
    ]);

    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const avgPriceResult = await this.prisma.offer.aggregate({
      where: { buyerId },
      _avg: { maxPrice: true }
    });

    return {
      totalOffers,
      activeOffers,
      acceptedOffers,
      totalSpent,
      averageOfferPrice: Number(avgPriceResult._avg.maxPrice) || 0
    };
  }

  async searchAvailableTickets(query: {
    eventId?: string;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    sectionId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: "ACTIVE",
      event: {}
    };

    if (query.eventId) {
      where.eventId = query.eventId;
    }

    if (query.city) {
      where.event.city = { contains: query.city, mode: "insensitive" };
    }

    if (query.state) {
      where.event.state = { contains: query.state, mode: "insensitive" };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              eventDate: true,
              venue: true,
              city: true,
              state: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      this.prisma.listing.count({ where })
    ]);

    return createPaginationResult(listings, total, page, limit);
  }

  async getBuyerTransactions(buyerId: string, query: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { buyerId };
    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          offer: {
            include: {
              event: {
                select: {
                  id: true,
                  name: true,
                  eventDate: true,
                  venue: true,
                  city: true,
                  state: true
                }
              }
            }
          },
          listing: {
            include: {
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      this.prisma.transaction.count({ where })
    ]);

    return createPaginationResult(transactions, total, page, limit);
  }
}
