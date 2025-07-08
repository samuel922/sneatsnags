import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Eye,
  Send,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminService, type SupportTicket } from '../../services/adminService';
import { SweetAlert } from '../../utils/sweetAlert';

interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
    search: '',
  });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketResponse, setTicketResponse] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSupportTickets({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setTickets(response.data);
      setPagination(prev => ({ ...prev, total: response.pagination?.total || 0 }));
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      SweetAlert.error('Failed to load tickets', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - in real app, this would come from your API
      const mockStats: SupportStats = {
        total: 156,
        open: 23,
        inProgress: 12,
        resolved: 98,
        closed: 23,
        avgResponseTime: 2.5,
        avgResolutionTime: 24.8,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const assignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      await adminService.assignSupportTicket(ticketId, assignedTo);
      SweetAlert.success('Ticket assigned', 'Ticket has been assigned successfully');
      fetchTickets();
    } catch (error) {
      SweetAlert.error('Failed to assign ticket', 'Please try again');
    }
  };

  const resolveTicket = async (ticketId: string, resolution: string) => {
    try {
      await adminService.resolveSupportTicket(ticketId, resolution);
      SweetAlert.success('Ticket resolved', 'Ticket has been marked as resolved');
      fetchTickets();
      setShowTicketModal(false);
    } catch (error) {
      SweetAlert.error('Failed to resolve ticket', 'Please try again');
    }
  };

  const sendResponse = async () => {
    if (!selectedTicket || !ticketResponse.trim()) return;

    try {
      // Mock sending response - in real app, this would be an API call
      SweetAlert.success('Response sent', 'Your response has been sent to the user');
      setTicketResponse('');
      setShowTicketModal(false);
    } catch (error) {
      SweetAlert.error('Failed to send response', 'Please try again');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Support Management</h1>
            <p className="text-gray-600 mt-2">Manage customer support tickets and requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchTickets} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.open || 0}</p>
              <p className="text-sm text-red-600">Needs attention</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.inProgress || 0}</p>
              <p className="text-sm text-yellow-600">Being worked on</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.avgResponseTime || 0}h</p>
              <p className="text-sm text-green-600">Target: 4h</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Agents</option>
              <option value="agent1">Agent 1</option>
              <option value="agent2">Agent 2</option>
              <option value="agent3">Agent 3</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{ticket.id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.subject}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          User #{ticket.userId.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {ticket.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowTicketModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignTicket(ticket.id, 'current-user')}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ticket #{selectedTicket.id.slice(-6)}
                </h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
                  <p className="text-gray-700">{selectedTicket.subject}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Response</h4>
                  <textarea
                    value={ticketResponse}
                    onChange={(e) => setTicketResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
                <div className="flex space-x-4">
                  <Button onClick={sendResponse} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                  <Button
                    onClick={() => resolveTicket(selectedTicket.id, ticketResponse)}
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};