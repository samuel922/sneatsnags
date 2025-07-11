import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Person, 
  Event, 
  LocationOn, 
  AttachMoney,
  Schedule,
  Info,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { sellerService } from '../../services/sellerService';
// Using native Date methods instead of date-fns
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
import SweetAlert from '../../utils/sweetAlert';

interface Offer {
  id: string;
  maxPrice: number;
  quantity: number;
  message: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sections: Array<{
    section: {
      id: string;
      name: string;
    };
  }>;
}

interface Listing {
  id: string;
  price: number;
  quantity: number;
  seats: string[];
  row: string;
  notes: string;
  event: {
    id: string;
    name: string;
    venue: string;
    eventDate: string;
  };
  section: {
    id: string;
    name: string;
  };
}

interface ListingOffersModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listing?: Listing;
}

export const ListingOffersModal: React.FC<ListingOffersModalProps> = ({
  open,
  onClose,
  listingId,
  listing: initialListing,
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [listing, setListing] = useState<Listing | null>(initialListing || null);
  const [loading, setLoading] = useState(false);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);

  useEffect(() => {
    if (open && listingId) {
      fetchListingOffers();
    }
  }, [open, listingId]);

  const fetchListingOffers = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getListingOffers(listingId);
      setOffers(response.data || []);
      setListing(response.listing);
    } catch (error) {
      console.error('Failed to fetch listing offers:', error);
      SweetAlert.error('Error', 'Failed to fetch offers for this listing');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setAcceptingOffer(offerId);
      
      const result = await SweetAlert.confirm(
        'Accept Offer',
        'Are you sure you want to accept this offer? This action cannot be undone.',
        'Accept',
        'Cancel'
      );

      if (result.isConfirmed) {
        SweetAlert.loading('Processing', 'Accepting offer...');
        
        await sellerService.acceptOffer(offerId, listingId);
        
        SweetAlert.success('Offer Accepted!', 'The offer has been accepted successfully. The transaction will now be processed.');
        
        // Refresh the offers list
        await fetchListingOffers();
        
        // Optionally close the modal
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to accept offer:', error);
      SweetAlert.error('Error', error.message || 'Failed to accept offer');
    } finally {
      setAcceptingOffer(null);
    }
  };

  const handleExpandOffer = (offerId: string) => {
    setExpandedOffer(expandedOffer === offerId ? null : offerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'EXPIRED': return 'error';
      case 'ACCEPTED': return 'info';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const isOfferExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isOfferAcceptable = (offer: Offer) => {
    return offer.status === 'ACTIVE' && !isOfferExpired(offer.expiresAt);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="listing-offers-dialog-title"
      aria-describedby="listing-offers-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }} id="listing-offers-dialog-title">
            Offers for Your Listing
          </Typography>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'text.secondary' }}
            aria-label="Close dialog"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {listing && (
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Event sx={{ mr: 1, color: 'primary.main' }} aria-hidden="true" />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  {listing.event.name}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    Venue: {listing.event.venue}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    Date: {formatDateTime(listing.event.eventDate)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} aria-hidden="true" />
                  <Typography variant="body2" color="text.secondary">
                    Your Price: {formatCurrency(listing.price)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={listing.section.name} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                {listing.row && (
                  <Chip 
                    label={`Row ${listing.row}`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
                <Chip 
                  label={`${listing.quantity} tickets`} 
                  size="small" 
                  variant="outlined" 
                />
                {listing.seats.length > 0 && (
                  <Chip 
                    label={`Seats: ${listing.seats.join(', ')}`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : offers.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No offers yet
            </Typography>
            <Typography variant="body2">
              There are currently no offers for this listing. Buyers can make offers on events, and you'll see them here if they match your listing's section.
            </Typography>
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table role="table" aria-label="Offers for listing">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Offer Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <React.Fragment key={offer.id}>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, color: 'text.secondary' }} aria-hidden="true" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {offer.buyer.firstName} {offer.buyer.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Offered on {formatDate(offer.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatCurrency(offer.maxPrice)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {offer.quantity} tickets
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={offer.status} 
                          size="small" 
                          color={getStatusColor(offer.status) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={isOfferExpired(offer.expiresAt) ? 'error' : 'text.secondary'}
                        >
                          {formatDateTime(offer.expiresAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleExpandOffer(offer.id)}
                            disabled={!offer.message && !offer.sections.length}
                            aria-label={expandedOffer === offer.id ? 'Collapse offer details' : 'Expand offer details'}
                            aria-expanded={expandedOffer === offer.id}
                          >
                            {expandedOffer === offer.id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                          
                          {isOfferAcceptable(offer) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={acceptingOffer === offer.id ? <CircularProgress size={16} /> : <CheckCircle />}
                              onClick={() => handleAcceptOffer(offer.id)}
                              disabled={acceptingOffer === offer.id}
                              aria-label={`Accept offer from ${offer.buyer.firstName} ${offer.buyer.lastName} for ${formatCurrency(offer.maxPrice)}`}
                            >
                              {acceptingOffer === offer.id ? 'Accepting...' : 'Accept'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    
                    {expandedOffer === offer.id && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0 }}>
                          <Collapse in={expandedOffer === offer.id}>
                            <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                              {offer.message && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Message from buyer:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {offer.message}
                                  </Typography>
                                </Box>
                              )}
                              
                              {offer.sections.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Acceptable sections:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {offer.sections.map((section) => (
                                      <Chip 
                                        key={section.section.id}
                                        label={section.section.name}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          aria-label="Close offers dialog"
          sx={{
            '&:focus-visible': {
              outline: '3px solid #3b82f6',
              outlineOffset: '2px'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};