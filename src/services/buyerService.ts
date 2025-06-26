import { PrismaClient } from "@prisma/client";
import { CreateOfferDTO, UpdateOfferDTO, OfferResponse } from "../types/buyer";
import { getPaginationParams, createPaginationResult } from "../utils/pagination";
import type { PaginationResult } from "../types/api";

export class BuyerService {
  constructor(private prisma: PrismaClient) {}

  async createOffer(buyerId: string, data: CreateOfferDTO): Promise<OfferResponse> {
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

    return {
      ...offer,
      sectionIds: sections.map((s) => s.sectionId),
    };
  }

  async listOffers(
    buyerId: string,
    query: any
  ): Promise<PaginationResult<OfferResponse>> {
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

    const mapped = offers.map((offer) => ({
      ...offer,
      sectionIds: offer.sections.map((s) => s.sectionId),
    }));

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

    return {
      ...offer,
      sectionIds: offer.sections.map((s) => s.sectionId),
    };
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

    return {
      ...offer,
      sectionIds: sections.map((s) => s.sectionId),
    };
  }

  async cancelOffer(buyerId: string, offerId: string): Promise<OfferResponse> {
    const offer = await this.prisma.offer.update({
      where: { id: offerId, buyerId },
      data: { status: "CANCELLED" },
      include: { sections: { select: { sectionId: true } } },
    });

    return {
      ...offer,
      sectionIds: offer.sections.map((s) => s.sectionId),
    };
  }
}
