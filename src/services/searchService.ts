import { prisma } from "../utils/prisma";
import { EventSearchQuery } from "../types/event";

export class SearchService {
  async searchEvents(query: EventSearchQuery & { userId?: string }) {
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
      userId,
    } = query;

    const offset = (page - 1) * limit;

    const where: any = {
      isActive: true,
      status: "ACTIVE",
      eventDate: { gt: new Date() }, // Only future events
    };

    // Location filters
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = state;

    // Event type and category filters
    if (eventType) where.eventType = eventType;
    if (category) where.category = { contains: category, mode: "insensitive" };

    // Date range filters
    if (dateFrom || dateTo) {
      if (dateFrom) where.eventDate.gte = new Date(dateFrom);
      if (dateTo) where.eventDate.lte = new Date(dateTo);
    }

    // Price range filters
    if (minPrice || maxPrice) {
      where.AND = where.AND || [];
      if (minPrice) {
        where.AND.push({
          OR: [
            { minPrice: { gte: minPrice } },
            {
              listings: {
                some: { price: { gte: minPrice }, status: "AVAILABLE" },
              },
            },
          ],
        });
      }
      if (maxPrice) {
        where.AND.push({
          OR: [
            { maxPrice: { lte: maxPrice } },
            {
              listings: {
                some: { price: { lte: maxPrice }, status: "AVAILABLE" },
              },
            },
          ],
        });
      }
    }

    // Text search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          sections: {
            select: {
              id: true,
              name: true,
              priceLevel: true,
            },
          },
          _count: {
            select: {
              offers: { where: { status: "ACTIVE" } },
              listings: { where: { status: "AVAILABLE" } },
            },
          },
          // Include user's offers if userId provided
          ...(userId && {
            offers: {
              where: { buyerId: userId, status: "ACTIVE" },
              select: {
                id: true,
                maxPrice: true,
                quantity: true,
                expiresAt: true,
              },
            },
          }),
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    // Calculate price ranges for each event
    const eventsWithPriceRanges = await Promise.all(
      events.map(async (event) => {
        const [listingPrices, offerPrices] = await Promise.all([
          prisma.listing.aggregate({
            where: { eventId: event.id, status: "AVAILABLE" },
            _min: { price: true },
            _max: { price: true },
          }),
          prisma.offer.aggregate({
            where: { eventId: event.id, status: "ACTIVE" },
            _min: { maxPrice: true },
            _max: { maxPrice: true },
          }),
        ]);

        return {
          ...event,
          priceRange: {
            listings: {
              min: listingPrices._min.price,
              max: listingPrices._max.price,
            },
            offers: {
              min: offerPrices._min.maxPrice,
              max: offerPrices._max.maxPrice,
            },
          },
        };
      })
    );

    return {
      data: eventsWithPriceRanges,
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

  async getPopularEvents(limit = 10) {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        status: "ACTIVE",
        eventDate: { gt: new Date() },
      },
      include: {
        _count: {
          select: {
            offers: { where: { status: "ACTIVE" } },
            listings: { where: { status: "AVAILABLE" } },
            transactions: true,
          },
        },
      },
      orderBy: [
        { offers: { _count: "desc" } },
        { transactions: { _count: "desc" } },
        { eventDate: "asc" },
      ],
      take: limit,
    });

    return events;
  }

  async getSuggestedEvents(userId: string, limit = 10) {
    // Get user's recent offer patterns
    const userOffers = await prisma.offer.findMany({
      where: { buyerId: userId },
      include: {
        event: { select: { eventType: true, city: true, state: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Extract preferences
    const eventTypes = [...new Set(userOffers.map((o) => o.event.eventType))];
    const cities = [...new Set(userOffers.map((o) => o.event.city))];
    const states = [...new Set(userOffers.map((o) => o.event.state))];

    // Find similar events
    const suggestedEvents = await prisma.event.findMany({
      where: {
        isActive: true,
        status: "ACTIVE",
        eventDate: { gt: new Date() },
        OR: [
          { eventType: { in: eventTypes } },
          { city: { in: cities } },
          { state: { in: states } },
        ],
        // Exclude events user already has offers for
        NOT: {
          offers: {
            some: { buyerId: userId, status: { in: ["ACTIVE", "ACCEPTED"] } },
          },
        },
      },
      include: {
        _count: {
          select: {
            offers: { where: { status: "ACTIVE" } },
            listings: { where: { status: "AVAILABLE" } },
          },
        },
      },
      orderBy: { eventDate: "asc" },
      take: limit,
    });

    return suggestedEvents;
  }
}
