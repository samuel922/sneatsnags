import { ApiResponse } from "../types/api";

export const successResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (
  message: string,
  errors?: string[]
): ApiResponse => ({
  success: false,
  message,
  errors,
});
