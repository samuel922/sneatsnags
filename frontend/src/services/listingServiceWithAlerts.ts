import { listingService } from './listingService';
import SweetAlert from '../utils/sweetAlert';
import type { Listing, CreateListingRequest, UpdateListingRequest, ListingFilters } from '../types/listing';
import type { PaginatedResponse, QueryParams } from '../types/api';

export const listingServiceWithAlerts = {
  // Public listing viewing methods
  async getListings(params?: QueryParams & ListingFilters): Promise<PaginatedResponse<Listing> | null> {
    try {
      const result = await listingService.getListings(params);
      return result;
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async getListing(id: string): Promise<Listing | null> {
    try {
      const result = await listingService.getListing(id);
      return result;
    } catch (error: any) {
      if (error.status === 404) {
        SweetAlert.error('Listing Not Found', 'The listing you\'re looking for doesn\'t exist or has been removed.');
      } else {
        SweetAlert.handleApiError(error);
      }
      return null;
    }
  },

  async searchListings(query: string, params?: QueryParams): Promise<PaginatedResponse<Listing> | null> {
    try {
      if (!query.trim()) {
        SweetAlert.warning('Search Required', 'Please enter a search term');
        return null;
      }
      
      const result = await listingService.searchListings(query, params);
      
      if (result.data.length === 0) {
        SweetAlert.info('No Results', 'No listings found matching your search criteria');
      }
      
      return result;
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  // Seller methods with alerts
  async createListing(data: CreateListingRequest): Promise<Listing | null> {
    try {
      SweetAlert.loading('Creating Listing', 'Please wait while we create your listing...');
      
      const result = await listingService.createListing(data);
      
      SweetAlert.close();
      SweetAlert.success('Listing Created!', 'Your listing has been created successfully');
      
      return result;
    } catch (error: any) {
      SweetAlert.close();
      
      if (error.status === 400) {
        SweetAlert.error('Invalid Data', error.message || 'Please check your listing details');
      } else if (error.status === 409) {
        SweetAlert.warning('Duplicate Listing', 'You already have a listing for these seats');
      } else {
        SweetAlert.handleApiError(error);
      }
      
      return null;
    }
  },

  async updateListing(id: string, data: UpdateListingRequest): Promise<Listing | null> {
    try {
      SweetAlert.loading('Updating Listing', 'Please wait while we update your listing...');
      
      const result = await listingService.updateListing(id, data);
      
      SweetAlert.close();
      SweetAlert.success('Listing Updated!', 'Your listing has been updated successfully');
      
      return result;
    } catch (error: any) {
      SweetAlert.close();
      
      if (error.status === 404) {
        SweetAlert.error('Listing Not Found', 'The listing you\'re trying to update doesn\'t exist');
      } else if (error.status === 403) {
        SweetAlert.error('Access Denied', 'You can only update your own listings');
      } else {
        SweetAlert.handleApiError(error);
      }
      
      return null;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const confirmed = await SweetAlert.deleteConfirmation('listing');
      
      if (!confirmed.isConfirmed) {
        return false;
      }
      
      SweetAlert.loading('Deleting Listing', 'Please wait while we delete your listing...');
      
      await listingService.deleteListing(id);
      
      SweetAlert.close();
      SweetAlert.success('Listing Deleted!', 'Your listing has been deleted successfully');
      
      return true;
    } catch (error: any) {
      SweetAlert.close();
      
      if (error.status === 404) {
        SweetAlert.error('Listing Not Found', 'The listing you\'re trying to delete doesn\'t exist');
      } else if (error.status === 403) {
        SweetAlert.error('Access Denied', 'You can only delete your own listings');
      } else {
        SweetAlert.handleApiError(error);
      }
      
      return false;
    }
  },

  async uploadTicketFiles(id: string, files: FileList): Promise<boolean> {
    try {
      if (!files || files.length === 0) {
        SweetAlert.warning('No Files Selected', 'Please select at least one file to upload');
        return false;
      }

      // Validate file types and sizes
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          SweetAlert.error('Invalid File Type', 'Only JPEG, PNG, and PDF files are allowed');
          return false;
        }
        if (file.size > maxSize) {
          SweetAlert.error('File Too Large', `${file.name} is too large. Files must be smaller than 10MB`);
          return false;
        }
      }

      SweetAlert.loading('Uploading Files', 'Please wait while we upload your ticket files...');
      
      await listingService.uploadTicketFiles(id, files);
      
      SweetAlert.close();
      SweetAlert.success('Files Uploaded!', `${files.length} file${files.length === 1 ? '' : 's'} uploaded successfully`);
      
      return true;
    } catch (error: any) {
      SweetAlert.close();
      
      if (error.status === 404) {
        SweetAlert.error('Listing Not Found', 'The listing you\'re trying to upload files for doesn\'t exist');
      } else if (error.status === 403) {
        SweetAlert.error('Access Denied', 'You can only upload files for your own listings');
      } else {
        SweetAlert.handleApiError(error);
      }
      
      return false;
    }
  },

  async markAsSold(id: string): Promise<boolean> {
    try {
      const confirmed = await SweetAlert.confirm(
        'Mark as Sold?',
        'Are you sure you want to mark this listing as sold? This action cannot be undone.',
        'Mark as Sold',
        'Cancel'
      );

      if (!confirmed.isConfirmed) {
        return false;
      }

      SweetAlert.loading('Updating Status', 'Please wait while we update your listing status...');
      
      await listingService.markAsSold(id);
      
      SweetAlert.close();
      SweetAlert.success('Listing Sold!', 'Your listing has been marked as sold');
      
      return true;
    } catch (error: any) {
      SweetAlert.close();
      
      if (error.status === 404) {
        SweetAlert.error('Listing Not Found', 'The listing you\'re trying to update doesn\'t exist');
      } else if (error.status === 403) {
        SweetAlert.error('Access Denied', 'You can only update your own listings');
      } else {
        SweetAlert.handleApiError(error);
      }
      
      return false;
    }
  },

  // Wrapper methods that don't need special handling
  async getRecentListings(params?: QueryParams): Promise<PaginatedResponse<Listing> | null> {
    try {
      return await listingService.getRecentListings(params);
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async getListingsByEvent(eventId: string, params?: QueryParams): Promise<PaginatedResponse<Listing> | null> {
    try {
      return await listingService.getListingsByEvent(eventId, params);
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async getListingsBySection(sectionId: string, params?: QueryParams): Promise<PaginatedResponse<Listing> | null> {
    try {
      return await listingService.getListingsBySection(sectionId, params);
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async getSimilarListings(id: string, params?: QueryParams): Promise<PaginatedResponse<Listing> | null> {
    try {
      return await listingService.getSimilarListings(id, params);
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async getListingStats(): Promise<any> {
    try {
      return await listingService.getListingStats();
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  // Seller-specific methods
  async getSellerListings(params?: QueryParams): Promise<PaginatedResponse<Listing> | null> {
    try {
      return await listingService.getSellerListings(params);
    } catch (error: any) {
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async createSellerListing(data: CreateListingRequest): Promise<Listing | null> {
    try {
      SweetAlert.loading('Creating Listing', 'Please wait while we create your listing...');
      
      const result = await listingService.createSellerListing(data);
      
      SweetAlert.close();
      SweetAlert.success('Listing Created!', 'Your listing has been created successfully');
      
      return result;
    } catch (error: any) {
      SweetAlert.close();
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async updateSellerListing(id: string, data: UpdateListingRequest): Promise<Listing | null> {
    try {
      SweetAlert.loading('Updating Listing', 'Please wait while we update your listing...');
      
      const result = await listingService.updateSellerListing(id, data);
      
      SweetAlert.close();
      SweetAlert.success('Listing Updated!', 'Your listing has been updated successfully');
      
      return result;
    } catch (error: any) {
      SweetAlert.close();
      SweetAlert.handleApiError(error);
      return null;
    }
  },

  async deleteSellerListing(id: string): Promise<boolean> {
    try {
      const confirmed = await SweetAlert.deleteConfirmation('listing');
      
      if (!confirmed.isConfirmed) {
        return false;
      }
      
      SweetAlert.loading('Deleting Listing', 'Please wait while we delete your listing...');
      
      await listingService.deleteSellerListing(id);
      
      SweetAlert.close();
      SweetAlert.success('Listing Deleted!', 'Your listing has been deleted successfully');
      
      return true;
    } catch (error: any) {
      SweetAlert.close();
      SweetAlert.handleApiError(error);
      return false;
    }
  },

  async uploadSellerTicketFiles(id: string, files: FileList): Promise<boolean> {
    try {
      if (!files || files.length === 0) {
        SweetAlert.warning('No Files Selected', 'Please select at least one file to upload');
        return false;
      }

      SweetAlert.loading('Uploading Files', 'Please wait while we upload your ticket files...');
      
      await listingService.uploadSellerTicketFiles(id, files);
      
      SweetAlert.close();
      SweetAlert.success('Files Uploaded!', `${files.length} file${files.length === 1 ? '' : 's'} uploaded successfully`);
      
      return true;
    } catch (error: any) {
      SweetAlert.close();
      SweetAlert.handleApiError(error);
      return false;
    }
  }
};

export default listingServiceWithAlerts;