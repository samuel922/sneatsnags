import { PaginationQuery } from "./api";
import { TransactionStatus } from "@prisma/client";

export interface TransactionSearchQuery extends PaginationQuery {
  buyerId?: string;
  sellerId?: string;
  eventId?: string;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
}
