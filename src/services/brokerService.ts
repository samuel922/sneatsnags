import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

export class BrokerService {
  async getBrokerIntegrations(userId: string, params: {
    skip: number;
    take: number;
    isActive?: boolean;
    integrationType?: string;
  }) {
    const { skip, take, isActive, integrationType } = params;
    
    const where: any = { userId };
    
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (integrationType) where.integrationType = integrationType;

    const [integrations, total] = await Promise.all([
      prisma.brokerIntegration.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          syncLogs: {
            take: 5,
            orderBy: { startedAt: "desc" },
          },
        },
      }),
      prisma.brokerIntegration.count({ where }),
    ]);

    return { integrations, total };
  }

  async getBrokerIntegrationById(id: string, userId: string) {
    return await prisma.brokerIntegration.findFirst({
      where: { id, userId },
      include: {
        syncLogs: {
          take: 10,
          orderBy: { startedAt: "desc" },
        },
      },
    });
  }

  async createBrokerIntegration(data: {
    userId: string;
    integrationType: any;
    name: string;
    credentials: any;
    syncSchedule?: string;
    fieldMappings?: any;
    syncPreferences?: any;
  }) {
    const integration = await prisma.brokerIntegration.create({
      data: {
        userId: data.userId,
        integrationType: data.integrationType,
        name: data.name,
        credentials: JSON.stringify(data.credentials), // Encrypt in production
        ...(data.syncSchedule && { syncSchedule: data.syncSchedule }),
        ...(data.fieldMappings && { fieldMappings: JSON.stringify(data.fieldMappings) }),
        ...(data.syncPreferences && { syncPreferences: JSON.stringify(data.syncPreferences) }),
      },
    });

    logger.info(`Broker integration created: ${integration.id} for user: ${data.userId}`);
    return integration;
  }

  async updateBrokerIntegration(id: string, userId: string, data: any) {
    const updateData = { ...data };
    
    if (data.credentials) {
      updateData.credentials = JSON.stringify(data.credentials);
    }
    
    if (data.fieldMappings) {
      updateData.fieldMappings = JSON.stringify(data.fieldMappings);
    }
    
    if (data.syncPreferences) {
      updateData.syncPreferences = JSON.stringify(data.syncPreferences);
    }

    const integration = await prisma.brokerIntegration.update({
      where: { id, userId },
      data: updateData,
    });

    logger.info(`Broker integration updated: ${id}`);
    return integration;
  }

  async deleteBrokerIntegration(id: string, userId: string) {
    await prisma.brokerIntegration.delete({
      where: { id, userId },
    });

    logger.info(`Broker integration deleted: ${id}`);
  }

  async testBrokerConnection(id: string, userId: string) {
    const integration = await prisma.brokerIntegration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    // Mock connection test - in production, this would test the actual broker connection
    const testResult = {
      success: Math.random() > 0.1, // 90% success rate for demo
      message: "Connection test completed",
      latency: Math.floor(Math.random() * 500) + 50, // Random latency between 50-550ms
      lastTestAt: new Date(),
    };

    if (!testResult.success) {
      testResult.message = "Connection failed - invalid credentials";
    }

    await prisma.brokerIntegration.update({
      where: { id },
      data: {
        lastSyncStatus: testResult.success ? "SYNCED" : "FAILED",
        errorCount: testResult.success ? 0 : integration.errorCount + 1,
      },
    });

    return testResult;
  }

  async triggerSync(id: string, userId: string, syncType: string = "INCREMENTAL") {
    const integration = await prisma.brokerIntegration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    if (!integration.isActive) {
      throw new Error("Integration is not active");
    }

    const syncLog = await prisma.brokerSyncLog.create({
      data: {
        brokerIntegrationId: id,
        syncType: syncType as any,
        status: "PENDING",
        startedAt: new Date(),
      },
    });

    // Simulate sync process
    setTimeout(async () => {
      try {
        const recordsProcessed = Math.floor(Math.random() * 1000) + 100;
        const successRate = Math.random() * 0.3 + 0.7; // 70-100% success rate
        const recordsSucceeded = Math.floor(recordsProcessed * successRate);
        const recordsFailed = recordsProcessed - recordsSucceeded;

        await prisma.brokerSyncLog.update({
          where: { id: syncLog.id },
          data: {
            status: recordsFailed > recordsProcessed * 0.1 ? "FAILED" : "SYNCED",
            recordsProcessed,
            recordsSucceeded,
            recordsFailed,
            completedAt: new Date(),
            processingTimeMs: Math.floor(Math.random() * 30000) + 5000,
          },
        });

        await prisma.brokerIntegration.update({
          where: { id },
          data: {
            lastSyncAt: new Date(),
            lastSyncStatus: recordsFailed > recordsProcessed * 0.1 ? "FAILED" : "SYNCED",
            errorCount: recordsFailed > recordsProcessed * 0.1 ? integration.errorCount + 1 : 0,
          },
        });
      } catch (error) {
        await prisma.brokerSyncLog.update({
          where: { id: syncLog.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            errorMessages: [error instanceof Error ? error.message : "Unknown error"],
          },
        });
      }
    }, 1000);

    logger.info(`Sync triggered for integration: ${id}`);
    return syncLog;
  }

  async getSyncLogs(id: string, userId: string, params: {
    skip: number;
    take: number;
    status?: string;
    syncType?: string;
  }) {
    const { skip, take, status, syncType } = params;
    
    // Verify integration belongs to user
    const integration = await prisma.brokerIntegration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const where: any = { brokerIntegrationId: id };
    
    if (status) where.status = status;
    if (syncType) where.syncType = syncType;

    const [logs, total] = await Promise.all([
      prisma.brokerSyncLog.findMany({
        where,
        skip,
        take,
        orderBy: { startedAt: "desc" },
      }),
      prisma.brokerSyncLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getSyncStats(id: string, userId: string, period: string = "30d") {
    // Verify integration belongs to user
    const integration = await prisma.brokerIntegration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const where = {
      brokerIntegrationId: id,
      startedAt: { gte: startDate },
    };

    const [totalSyncs, successfulSyncs, failedSyncs, avgProcessingTime, totalRecords, lastSuccess, lastFailure] = await Promise.all([
      prisma.brokerSyncLog.count({ where }),
      prisma.brokerSyncLog.count({ where: { ...where, status: "SYNCED" } }),
      prisma.brokerSyncLog.count({ where: { ...where, status: "FAILED" } }),
      prisma.brokerSyncLog.aggregate({
        where: { ...where, processingTimeMs: { not: null } },
        _avg: { processingTimeMs: true },
      }),
      prisma.brokerSyncLog.aggregate({
        where,
        _sum: { recordsProcessed: true },
      }),
      prisma.brokerSyncLog.findFirst({
        where: { ...where, status: "SYNCED" },
        orderBy: { completedAt: "desc" },
      }),
      prisma.brokerSyncLog.findFirst({
        where: { ...where, status: "FAILED" },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      avgProcessingTime: avgProcessingTime._avg.processingTimeMs || 0,
      totalRecordsProcessed: totalRecords._sum.recordsProcessed || 0,
      lastSuccessfulSync: lastSuccess?.completedAt || null,
      lastFailedSync: lastFailure?.completedAt || null,
    };
  }

  async updateSyncSchedule(id: string, userId: string, syncSchedule: string) {
    const integration = await prisma.brokerIntegration.update({
      where: { id, userId },
      data: { syncSchedule },
    });

    logger.info(`Sync schedule updated for integration: ${id}`);
    return integration;
  }

  async toggleIntegrationStatus(id: string, userId: string) {
    const integration = await prisma.brokerIntegration.findFirst({
      where: { id, userId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const updatedIntegration = await prisma.brokerIntegration.update({
      where: { id },
      data: { isActive: !integration.isActive },
    });

    logger.info(`Integration status toggled: ${id} - Active: ${updatedIntegration.isActive}`);
    return updatedIntegration;
  }

  async validateCredentials(integrationType: string, credentials: any) {
    // Mock credential validation - in production, this would validate against the actual broker API
    const validationResult = {
      valid: Math.random() > 0.2, // 80% success rate for demo
      message: "Credentials validated successfully",
      permissions: ["read", "write"],
    };

    if (!validationResult.valid) {
      validationResult.message = "Invalid credentials provided";
      validationResult.permissions = [];
    }

    return validationResult;
  }
}

export const brokerService = new BrokerService();