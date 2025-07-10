export interface CreateBrokerIntegrationRequest {
  integrationType:
    | "SKYBOX"
    | "AUTOPROCESSOR"
    | "TICKET_EVOLUTION"
    | "CUSTOM_FTP";
  name: string;
  credentials: {
    ftpHost?: string;
    ftpUser?: string;
    ftpPassword?: string;
    apiKey?: string;
    apiSecret?: string;
    [key: string]: any;
  };
  syncSchedule: string; // Cron expression
  fieldMappings?: Record<string, string>;
  syncPreferences?: {
    autoAcceptOffers?: boolean;
    priceMarkup?: number;
    minProfit?: number;
    [key: string]: any;
  };
}

export interface UpdateBrokerIntegrationRequest {
  name?: string;
  credentials?: Record<string, any>;
  syncSchedule?: string;
  fieldMappings?: Record<string, string>;
  syncPreferences?: Record<string, any>;
  isActive?: boolean;
}
