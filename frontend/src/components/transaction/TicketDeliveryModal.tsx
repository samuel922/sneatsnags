import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, LinearProgress } from '@mui/material';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { 
  X, 
  Upload, 
  File, 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Send, 
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import SweetAlert from '../../utils/sweetAlert';

// Helper function to format names safely
const formatName = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) return 'Name not available';
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
};

interface TicketDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
  onDeliveryComplete?: () => void;
}

interface TicketFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploaded?: boolean;
}

export const TicketDeliveryModal: React.FC<TicketDeliveryModalProps> = ({
  open,
  onClose,
  transaction,
  onDeliveryComplete
}) => {
  const [ticketFiles, setTicketFiles] = useState<TicketFile[]>([]);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'platform'>('platform');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: TicketFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false
    }));
    
    setTicketFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setTicketFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleDeliverTickets = async () => {
    if (ticketFiles.length === 0) {
      SweetAlert.warning('No Files Selected', 'Please upload at least one ticket file before delivering.');
      return;
    }

    const result = await SweetAlert.confirm(
      'Deliver Tickets',
      `Are you sure you want to deliver ${ticketFiles.length} ticket file(s) to ${formatName(transaction.buyer?.firstName, transaction.buyer?.lastName)}?`,
      'Yes, Deliver Tickets',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setUploading(true);
        SweetAlert.loading('Delivering Tickets', 'Uploading files and notifying buyer...');

        // Simulate file upload progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // In a real implementation, you would upload files to a server
        // For now, we'll just simulate the API call
        await paymentService.markTicketsDelivered(transaction.id);

        // Simulate sending email notification
        await new Promise(resolve => setTimeout(resolve, 1000));

        SweetAlert.close();
        SweetAlert.success(
          'Tickets Delivered Successfully!', 
          `The buyer has been notified and can access the tickets. They will be prompted to confirm receipt to release payment.`
        );

        if (onDeliveryComplete) {
          onDeliveryComplete();
        }
        onClose();
      } catch (error) {
        SweetAlert.close();
        SweetAlert.error('Delivery Failed', 'Failed to deliver tickets. Please try again.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!deliveryMessage.trim()) {
      SweetAlert.warning('Message Required', 'Please enter a message to send to the buyer.');
      return;
    }

    try {
      SweetAlert.loading('Sending Message', 'Sending message to buyer...');
      
      // Simulate API call to send message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      SweetAlert.close();
      SweetAlert.success('Message Sent!', 'Your message has been sent to the buyer.');
      setDeliveryMessage('');
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error('Message Failed', 'Failed to send message. Please try again.');
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>Deliver Tickets</span>
          <IconButton onClick={onClose} size="small">
            <X className="h-4 w-4" />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{transaction.offer.event.name}</h3>
                  <p className="text-gray-600">
                    {transaction.offer.quantity} ticket{transaction.offer.quantity > 1 ? 's' : ''} • 
                    Seats: {transaction.listing.seats.join(', ')}
                    {transaction.listing.row && ` • Row: ${transaction.listing.row}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Buyer</p>
                  <p className="font-medium">{formatName(transaction.buyer?.firstName, transaction.buyer?.lastName)}</p>
                  <p className="text-sm text-gray-600">{transaction.buyer?.email}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Upload and deliver the actual ticket files to complete this transaction
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Ticket Files
              </h3>
              
              <div className="mb-4">
                <label 
                  htmlFor="ticket-files"
                  className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">Click to upload ticket files</p>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, PNG, JPG files up to 10MB each
                    </p>
                  </div>
                  <input
                    id="ticket-files"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* File List */}
              {ticketFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Selected Files:</h4>
                  {ticketFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.uploaded && <CheckCircle className="h-4 w-4 text-green-500" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                          disabled={uploading}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Uploading...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Message */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Message to Buyer (Optional)
              </h3>
              
              <textarea
                value={deliveryMessage}
                onChange={(e) => setDeliveryMessage(e.target.value)}
                placeholder="Add any special instructions or notes for the buyer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                disabled={uploading}
              />
              
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!deliveryMessage.trim() || uploading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Method</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="platform"
                    checked={deliveryMethod === 'platform'}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'platform')}
                    className="text-blue-600"
                    disabled={uploading}
                  />
                  <div>
                    <p className="font-medium">Platform Delivery (Recommended)</p>
                    <p className="text-sm text-gray-600">
                      Files are securely stored and buyer gets immediate access
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="email"
                    checked={deliveryMethod === 'email'}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'email')}
                    className="text-blue-600"
                    disabled={uploading}
                  />
                  <div>
                    <p className="font-medium">Email Delivery</p>
                    <p className="text-sm text-gray-600">
                      Files are sent directly to buyer's email address
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Instructions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                  <div>
                    <p className="font-medium">Upload ticket files</p>
                    <p className="text-sm text-gray-600">Select and upload the actual tickets (PDF, images, etc.)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                  <div>
                    <p className="font-medium">Deliver to buyer</p>
                    <p className="text-sm text-gray-600">Buyer receives notification and can access tickets</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
                  <div>
                    <p className="font-medium">Get paid</p>
                    <p className="text-sm text-gray-600">Once buyer confirms receipt, payment is released to you</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeliverTickets}
              disabled={ticketFiles.length === 0 || uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Delivering...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Deliver Tickets
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};