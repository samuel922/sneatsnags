import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { eventServiceV2 } from "../services/eventService.v2";
import { logger } from "../utils/logger";
import { 
  CreateEventRequest,
  UpdateEventRequest,
  EventSearchQuery,
  CreateSectionRequest,
  UpdateSectionRequest,
  BulkEventOperation,
  EventStatsQuery,
} from "../validations/eventValidation";
import { 
  EventError,
  EventNotFoundError,
  EventValidationError,
  isEventError,
} from "../errors/eventErrors";

// Standard response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class EventControllerV2 {
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private successResponse<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  private errorResponse(
    error: string, 
    code?: string, 
    details?: any, 
    requestId?: string
  ): ApiResponse {
    return {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  private paginatedResponse<T>(
    data: T[],
    pagination: any,
    message?: string,
    requestId?: string
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination,
      message,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  private handleError(error: any, req: Request, res: Response, requestId?: string): void {
    if (isEventError(error)) {
      logger.error("Event operation failed", {
        error: error.message,
        code: error.code,
        details: error.details,
        requestId,
        endpoint: req.path,
        method: req.method,
        userId: (req as AuthenticatedRequest).user?.id,
      });

      res.status(error.statusCode).json(
        this.errorResponse(error.message, error.code, error.details, requestId)
      );
      return;
    }

    logger.error("Unexpected error in event operation", {
      error: error.message,
      stack: error.stack,
      requestId,
      endpoint: req.path,
      method: req.method,
      userId: (req as AuthenticatedRequest).user?.id,
    });

    res.status(500).json(
      this.errorResponse("Internal server error", "INTERNAL_SERVER_ERROR", undefined, requestId)
    );
  }

  /**
   * Create a new event (Admin only)
   */
  createEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      logger.info("Event creation request received", {
        requestId,
        eventName: req.body.name,
        userId: req.user?.id,
        userRole: req.user?.role,
      });

      const eventData = req.body as CreateEventRequest;
      const event = await eventServiceV2.createEvent(eventData, req.user?.id);

      const duration = Date.now() - startTime;
      logger.info("Event created successfully", {
        requestId,
        eventId: event.id,
        eventName: event.name,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.status(201).json(
        this.successResponse(event, "Event created successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Get events with filtering and pagination (Public)
   */
  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      logger.info("Events list request received", {
        requestId,
        query: req.query,
      });

      const query = req.query as unknown as EventSearchQuery;
      const result = await eventServiceV2.getEvents(query);

      const duration = Date.now() - startTime;
      logger.info("Events retrieved successfully", {
        requestId,
        count: result.data.length,
        total: result.pagination.total,
        duration: `${duration}ms`,
      });

      res.json(
        this.paginatedResponse(
          result.data,
          result.pagination,
          "Events retrieved successfully",
          requestId
        )
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Get single event by ID (Public)
   */
  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { id } = req.params;
      const includeStats = req.query.includeStats === 'true';

      logger.info("Event detail request received", {
        requestId,
        eventId: id,
        includeStats,
      });

      const event = await eventServiceV2.getEventById(id, includeStats);

      if (!event) {
        logger.warn("Event not found", {
          requestId,
          eventId: id,
        });

        res.status(404).json(
          this.errorResponse("Event not found", "EVENT_NOT_FOUND", { eventId: id }, requestId)
        );
        return;
      }

      const duration = Date.now() - startTime;
      logger.info("Event retrieved successfully", {
        requestId,
        eventId: id,
        eventName: event.name,
        duration: `${duration}ms`,
      });

      res.json(
        this.successResponse(event, "Event retrieved successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Update event (Admin only)
   */
  updateEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { id } = req.params;
      const updateData = req.body as UpdateEventRequest;

      logger.info("Event update request received", {
        requestId,
        eventId: id,
        updateFields: Object.keys(updateData),
        userId: req.user?.id,
      });

      const event = await eventServiceV2.updateEvent(id, updateData, req.user?.id);

      const duration = Date.now() - startTime;
      logger.info("Event updated successfully", {
        requestId,
        eventId: id,
        eventName: event.name,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json(
        this.successResponse(event, "Event updated successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Delete event (Admin only)
   */
  deleteEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { id } = req.params;

      logger.info("Event deletion request received", {
        requestId,
        eventId: id,
        userId: req.user?.id,
      });

      await eventServiceV2.deleteEvent(id, req.user?.id);

      const duration = Date.now() - startTime;
      logger.info("Event deleted successfully", {
        requestId,
        eventId: id,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json(
        this.successResponse(null, "Event deleted successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Get event statistics (Public)
   */
  getEventStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { id } = req.params;

      logger.info("Event stats request received", {
        requestId,
        eventId: id,
      });

      const stats = await eventServiceV2.getEventStats(id);

      const duration = Date.now() - startTime;
      logger.info("Event stats retrieved successfully", {
        requestId,
        eventId: id,
        duration: `${duration}ms`,
      });

      res.json(
        this.successResponse(stats, "Event statistics retrieved successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Search events (Public)
   */
  searchEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { q: query } = req.query;

      if (!query) {
        res.status(400).json(
          this.errorResponse("Search query is required", "MISSING_SEARCH_QUERY", undefined, requestId)
        );
        return;
      }

      logger.info("Event search request received", {
        requestId,
        query,
        filters: req.query,
      });

      const searchQuery = {
        ...req.query,
        search: query,
      } as EventSearchQuery;

      const result = await eventServiceV2.getEvents(searchQuery);

      const duration = Date.now() - startTime;
      logger.info("Event search completed successfully", {
        requestId,
        query,
        resultsCount: result.data.length,
        duration: `${duration}ms`,
      });

      res.json(
        this.paginatedResponse(
          result.data,
          result.pagination,
          "Search completed successfully",
          requestId
        )
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Get popular events (Public)
   */
  getPopularEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { limit = 10 } = req.query;

      logger.info("Popular events request received", {
        requestId,
        limit,
      });

      const searchQuery = {
        page: 1,
        limit: parseInt(limit as string),
        sortBy: 'popularity' as const,
        sortOrder: 'desc' as const,
        isActive: true,
      } as EventSearchQuery;

      const result = await eventServiceV2.getEvents(searchQuery);

      const duration = Date.now() - startTime;
      logger.info("Popular events retrieved successfully", {
        requestId,
        count: result.data.length,
        duration: `${duration}ms`,
      });

      res.json(
        this.successResponse(result.data, "Popular events retrieved successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Get upcoming events (Public)
   */
  getUpcomingEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const { limit = 10, city, state } = req.query;

      logger.info("Upcoming events request received", {
        requestId,
        limit,
        city,
        state,
      });

      const searchQuery = {
        limit: parseInt(limit as string),
        city: city as string,
        state: state as string,
        dateFrom: new Date().toISOString(),
        sortBy: 'eventDate',
        sortOrder: 'asc',
        isActive: true,
      } as EventSearchQuery;

      const result = await eventServiceV2.getEvents(searchQuery);

      const duration = Date.now() - startTime;
      logger.info("Upcoming events retrieved successfully", {
        requestId,
        count: result.data.length,
        duration: `${duration}ms`,
      });

      res.json(
        this.successResponse(result.data, "Upcoming events retrieved successfully", requestId)
      );
    } catch (error) {
      this.handleError(error, req, res, requestId);
    }
  };

  /**
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      // Simple database connection check
      const eventCount = await eventServiceV2.getEvents({ 
        page: 1, 
        limit: 1, 
        sortBy: 'eventDate' as const, 
        sortOrder: 'asc' as const 
      });
      
      res.json(
        this.successResponse(
          {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            version: '2.0.0',
          },
          "Service is healthy",
          requestId
        )
      );
    } catch (error) {
      logger.error("Health check failed", {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(503).json(
        this.errorResponse("Service unavailable", "SERVICE_UNAVAILABLE", undefined, requestId)
      );
    }
  };
}

export const eventControllerV2 = new EventControllerV2();