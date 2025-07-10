import { Request, Response, NextFunction } from "express";
import { SearchService } from "../services/searchService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";

const searchService = new SearchService();

export const searchEvents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      ...req.query,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      userId: req.user?.id,
    };

    const events = await searchService.searchEvents(query);
    res.json({
      success: true,
      data: events.data,
      pagination: events.pagination,
    });
  } catch (error: any) {
    logger.error("Search events error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getPopularEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const events = await searchService.getPopularEvents(limit);
    res.json({ success: true, data: events });
  } catch (error: any) {
    logger.error("Get popular events error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getSuggestedEvents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const events = await searchService.getSuggestedEvents(userId, limit);
    res.json({ success: true, data: events });
  } catch (error: any) {
    logger.error("Get suggested events error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};
