import { PaginationQuery, PaginationResponse } from "../types/api";

export const getPaginationParams = (query: PaginationQuery) => {
  const page = Math.max(1, parseInt(String(query.page || "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || "20"))));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
