import { prisma } from "../utils/prisma";
import {
  CreateEventRequest,
  EventSearchQuery,
  UpdateEventRequest,
} from "../types/event";
import { PaginationResponse } from "../types/api";
import { logger } from "../utils/logger";

export class EventService {
  async createEvent(data: CreateEventRequest) {
    const { sections, ...eventData } = data;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        sections: {
          create: sections,
        },
      },
      include: {
        sections: true,
      },
    });

    logger.info(`Event created: ${event.id}`);
    return event;
  }

  async getEvents(query: EventSearchQuery): Promise<PaginationResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "eventDate",
      sortOrder = "asc",
      city,
      state,
      eventType,
      category,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      search,
    } = query;

    const offset = (page - 1) * limit;

    const where: any = {
      isActive: true,
      status: "ACTIVE",
    };

    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = state;
    if (eventType) where.eventType = eventType;
    if (category) where.category = { contains: category, mode: "insensitive" };
    if (dateFrom || dateTo) {
      where.eventDate = {};
      if (dateFrom) where.eventDate.gte = new Date(dateFrom);
      if (dateTo) where.eventDate.lte = new Date(dateTo);
    }
    if (minPrice || maxPrice) {
      where.AND = where.AND || [];
      if (minPrice) where.AND.push({ minPrice: { gte: minPrice } });
      if (maxPrice) where.AND.push({ maxPrice: { lte: maxPrice } });
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          sections: true,
          _count: {
            select: {
              offers: { where: { status: "ACTIVE" } },
              listings: { where: { status: "AVAILABLE" } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events,
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

  async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        sections: true,
        _count: {
          select: {
            offers: { where: { status: "ACTIVE" } },
            listings: { where: { status: "AVAILABLE" } },
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  }

  async updateEvent(eventId: string, data: UpdateEventRequest) {
    const event = await prisma.event.update({
      where: { id: eventId },
      data,
      include: {
        sections: true,
      },
    });

    logger.info(`Event updated: ${eventId}`);
    return event;
  }

  async deleteEvent(eventId: string) {
    // Check for active offers or listings
    const [activeOffers, activeListings] = await Promise.all([
      prisma.offer.count({
        where: { eventId, status: "ACTIVE" },
      }),
      prisma.listing.count({
        where: { eventId, status: "AVAILABLE" },
      }),
    ]);

    if (activeOffers > 0 || activeListings > 0) {
      throw new Error("Cannot delete event with active offers or listings");
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { isActive: false },
    });

    logger.info(`Event deleted: ${eventId}`);
    return { message: "Event deleted successfully" };
  }

  async getEventStats(eventId: string) {
    const stats = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        _count: {
          select: {
            offers: true,
            listings: true,
            transactions: true,
          },
        },
      },
    });

    if (!stats) {
      throw new Error("Event not found");
    }

    const [averageOfferPrice, averageListingPrice] = await Promise.all([
      prisma.offer.aggregate({
        where: { eventId, status: "ACTIVE" },
        _avg: { maxPrice: true },
      }),
      prisma.listing.aggregate({
        where: { eventId, status: "AVAILABLE" },
        _avg: { price: true },
      }),
    ]);

    return {
      totalOffers: stats._count.offers,
      totalListings: stats._count.listings,
      totalTransactions: stats._count.transactions,
      averageOfferPrice: averageOfferPrice._avg.maxPrice || 0,
      averageListingPrice: averageListingPrice._avg.price || 0,
    };
  }
}
