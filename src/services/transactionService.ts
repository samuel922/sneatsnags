import { prisma } from "../utils/prisma";
import { TransactionSearchQuery } from "../types/transaction";
import { PaginationResponse } from "../types/api";
import { logger } from "../utils/logger";

export class TransactionService {
  async getTransactions(
    query: TransactionSearchQuery
  ): Promise<PaginationResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      buyerId,
      sellerId,
      eventId,
      status,
      dateFrom,
      dateTo,
    } = query;

    const offset = (page - 1) * limit;

    const where: any = {};

    if (buyerId) where.buyerId = buyerId;
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;
    if (sellerId) {
      where.listing = { sellerId };
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          listing: {
            include: {
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              section: {
                select: {
                  name: true,
                },
              },
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
          offer: {
            select: {
              id: true,
              maxPrice: true,
              quantity: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
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

  async getTransactionById(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            section: {
              select: {
                name: true,
              },
            },
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
        offer: {
          select: {
            id: true,
            maxPrice: true,
            quantity: true,
            message: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check if user is authorized to view this transaction
    if (
      transaction.buyerId !== userId &&
      transaction.listing.sellerId !== userId
    ) {
      throw new Error("Unauthorized");
    }

    return transaction;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: string,
    notes?: string
  ) {
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        notes,
        ...(status === "COMPLETED" && {
          ticketsDelivered: true,
          ticketsDeliveredAt: new Date(),
        }),
        ...(status === "REFUNDED" && { refundedAt: new Date() }),
      },
      include: {
        buyer: true,
        listing: { include: { seller: true } },
        event: true,
      },
    });

    logger.info(`Transaction ${transactionId} status updated to ${status}`);
    return transaction;
  }

  async getUserTransactionStats(userId: string) {
    const [buyerStats, sellerStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: { buyerId: userId, status: "COMPLETED" },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { listing: { sellerId: userId }, status: "COMPLETED" },
        _count: { id: true },
        _sum: { sellerAmount: true },
      }),
    ]);

    return {
      buyer: {
        totalTransactions: buyerStats._count.id,
        totalSpent: buyerStats._sum.amount || 0,
      },
      seller: {
        totalTransactions: sellerStats._count.id,
        totalEarned: sellerStats._sum.sellerAmount || 0,
      },
    };
  }
}
