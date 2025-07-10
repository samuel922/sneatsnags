import { PaginationQuery } from "./api";
import { $Enums } from "@prisma/client";

type TransactionStatus = $Enums.TransactionStatus;

export interface TransactionSearchQuery extends PaginationQuery {
  buyerId?: string;
  sellerId?: string;
  eventId?: string;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
}
