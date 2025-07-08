import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  RefreshCw,
  AlertCircle,
  Zap,
  Shield,
  Settings,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SweetAlert } from '../../utils/sweetAlert';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: string;
  responseTime: number;
  url?: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  service: string;
}

export const MonitoringPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend API endpoints
      const [metricsResponse, servicesResponse, alertsResponse] = await Promise.all([
        fetch('/api/admin/system/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/system/services', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/system/alerts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.data);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data);
      }

      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to fetch system data:', error);
      SweetAlert.error('Failed to load system data', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      SweetAlert.success('Alert acknowledged', 'Alert has been marked as acknowledged');
    } catch (error) {
      SweetAlert.error('Failed to acknowledge alert', 'Please try again');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };


  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  if (loading && !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-2">Real-time system health and performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
            <Button onClick={fetchSystemData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
            <Cpu className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Usage</span>
              <span className="text-sm font-medium">{metrics?.cpu.usage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics?.cpu.usage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {metrics?.cpu.cores} cores • Load: {metrics?.cpu.load.join(', ')}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Memory</h3>
            <HardDrive className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium">{metrics?.memory.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics?.memory.percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {metrics?.memory.used} GB / {metrics?.memory.total} GB
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
            <Database className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium">{metrics?.disk.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics?.disk.percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {metrics?.disk.used} GB / {metrics?.disk.total} GB
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Network</h3>
            <Wifi className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Inbound</span>
              <span className="text-sm font-medium">{metrics?.network.inbound.toFixed(1)} MB/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Outbound</span>
              <span className="text-sm font-medium">{metrics?.network.outbound.toFixed(1)} MB/s</span>
            </div>
            <div className="text-sm text-gray-600">
              Latency: {metrics?.network.latency}ms
            </div>
          </div>
        </Card>
      </div>

      {/* Service Status */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
            <Server className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      Uptime: {formatUptime(service.uptime)} • Response: {service.responseTime}ms
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-600">
                          {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No alerts at this time
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">System Logs</p>
              <p className="text-sm text-gray-600">View detailed system logs</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Security Status</p>
              <p className="text-sm text-gray-600">Monitor security events</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Zap className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-900">Performance</p>
              <p className="text-sm text-gray-600">Analyze performance metrics</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Configuration</p>
              <p className="text-sm text-gray-600">Manage system settings</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};