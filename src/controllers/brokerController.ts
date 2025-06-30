import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import { logger } from "../utils/logger";
import { getPaginationParams, createPaginationResult } from "../utils/pagination";
import { AuthenticatedRequest } from "../types/auth";

import { brokerService } from "../services/brokerService";

export const brokerController = {
  // Get all broker integrations for current user
  getBrokerIntegrations: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { isActive, integrationType } = req.query;

      const result = await brokerService.getBrokerIntegrations(userId, {
        skip,
        take: limit,
        isActive: isActive === 'true',
        integrationType: integrationType as string,
      });

      const paginatedResult = createPaginationResult(
        result.integrations,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Broker integrations retrieved"));
    } catch (error) {
      logger.error("Get broker integrations error:", error);
      res.status(500).json(errorResponse("Failed to retrieve broker integrations"));
    }
  },

  // Get single broker integration by ID
  getBrokerIntegrationById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const integration = await brokerService.getBrokerIntegrationById(id, userId);
      
      if (!integration) {
        return res.status(404).json(errorResponse("Broker integration not found"));
      }

      res.json(successResponse(integration, "Broker integration retrieved"));
    } catch (error) {
      logger.error("Get broker integration by ID error:", error);
      res.status(500).json(errorResponse("Failed to retrieve broker integration"));
    }
  },

  // Create new broker integration
  createBrokerIntegration: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const integrationData = { ...req.body, userId };
      
      const integration = await brokerService.createBrokerIntegration(integrationData);
      
      res.status(201).json(successResponse(integration, "Broker integration created successfully"));
    } catch (error) {
      logger.error("Create broker integration error:", error);
      res.status(500).json(errorResponse("Failed to create broker integration"));
    }
  },

  // Update broker integration
  updateBrokerIntegration: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const integration = await brokerService.updateBrokerIntegration(id, userId, req.body);
      
      res.json(successResponse(integration, "Broker integration updated successfully"));
    } catch (error) {
      logger.error("Update broker integration error:", error);
      res.status(500).json(errorResponse("Failed to update broker integration"));
    }
  },

  // Delete broker integration
  deleteBrokerIntegration: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      await brokerService.deleteBrokerIntegration(id, userId);
      
      res.json(successResponse(null, "Broker integration deleted successfully"));
    } catch (error) {
      logger.error("Delete broker integration error:", error);
      res.status(500).json(errorResponse("Failed to delete broker integration"));
    }
  },

  // Test broker connection
  testBrokerConnection: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const result = await brokerService.testBrokerConnection(id, userId);
      
      res.json(successResponse(result, "Broker connection tested"));
    } catch (error) {
      logger.error("Test broker connection error:", error);
      res.status(500).json(errorResponse("Failed to test broker connection"));
    }
  },

  // Trigger manual sync
  triggerSync: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { syncType = 'INCREMENTAL' } = req.body;
      
      const syncLog = await brokerService.triggerSync(id, userId, syncType);
      
      res.json(successResponse(syncLog, "Sync triggered successfully"));
    } catch (error) {
      logger.error("Trigger sync error:", error);
      res.status(500).json(errorResponse("Failed to trigger sync"));
    }
  },

  // Get sync logs for integration
  getSyncLogs: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { page, limit, skip } = getPaginationParams(req.query);
      const { status, syncType } = req.query;

      const result = await brokerService.getSyncLogs(id, userId, {
        skip,
        take: limit,
        status: status as string,
        syncType: syncType as string,
      });

      const paginatedResult = createPaginationResult(
        result.logs,
        result.total,
        page,
        limit
      );

      res.json(successResponse(paginatedResult, "Sync logs retrieved"));
    } catch (error) {
      logger.error("Get sync logs error:", error);
      res.status(500).json(errorResponse("Failed to retrieve sync logs"));
    }
  },

  // Get sync statistics
  getSyncStats: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { period = '30d' } = req.query;
      
      const stats = await brokerService.getSyncStats(id, userId, period as string);
      
      res.json(successResponse(stats, "Sync statistics retrieved"));
    } catch (error) {
      logger.error("Get sync stats error:", error);
      res.status(500).json(errorResponse("Failed to retrieve sync statistics"));
    }
  },

  // Update sync schedule
  updateSyncSchedule: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { syncSchedule } = req.body;
      
      if (!syncSchedule) {
        return res.status(400).json(errorResponse("Sync schedule is required"));
      }
      
      const integration = await brokerService.updateSyncSchedule(id, userId, syncSchedule);
      
      res.json(successResponse(integration, "Sync schedule updated successfully"));
    } catch (error) {
      logger.error("Update sync schedule error:", error);
      res.status(500).json(errorResponse("Failed to update sync schedule"));
    }
  },

  // Toggle integration active status
  toggleIntegrationStatus: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const integration = await brokerService.toggleIntegrationStatus(id, userId);
      
      res.json(successResponse(integration, "Integration status updated successfully"));
    } catch (error) {
      logger.error("Toggle integration status error:", error);
      res.status(500).json(errorResponse("Failed to update integration status"));
    }
  },

  // Get supported integration types
  getSupportedTypes: async (req: Request, res: Response) => {
    try {
      const types = [
        {
          type: 'SKYBOX',
          name: 'SkyBox',
          description: 'SkyBox ticket broker integration',
          requirements: ['FTP credentials', 'API key'],
          features: ['Inventory sync', 'Price updates', 'Order management'],
        },
        {
          type: 'AUTOPROCESSOR',
          name: 'AutoProcessor',
          description: 'AutoProcessor ticket broker integration',
          requirements: ['FTP credentials', 'Account ID'],
          features: ['Inventory sync', 'Automated processing'],
        },
        {
          type: 'TICKET_EVOLUTION',
          name: 'Ticket Evolution',
          description: 'Ticket Evolution broker integration',
          requirements: ['API credentials', 'Office ID'],
          features: ['Real-time inventory', 'Order tracking'],
        },
        {
          type: 'CUSTOM_FTP',
          name: 'Custom FTP',
          description: 'Custom FTP-based integration',
          requirements: ['FTP credentials', 'File format specification'],
          features: ['File-based sync', 'Custom mapping'],
        },
      ];
      
      res.json(successResponse(types, "Supported integration types retrieved"));
    } catch (error) {
      logger.error("Get supported types error:", error);
      res.status(500).json(errorResponse("Failed to retrieve supported types"));
    }
  },

  // Validate broker credentials
  validateCredentials: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { integrationType, credentials } = req.body;
      
      if (!integrationType || !credentials) {
        return res.status(400).json(errorResponse("Integration type and credentials are required"));
      }
      
      const result = await brokerService.validateCredentials(integrationType, credentials);
      
      res.json(successResponse(result, "Credentials validated"));
    } catch (error) {
      logger.error("Validate credentials error:", error);
      res.status(500).json(errorResponse("Failed to validate credentials"));
    }
  },
};