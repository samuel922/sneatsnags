import { useCallback } from 'react';
import SweetAlert from '../utils/sweetAlert';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: ApiError) => {
    // Network error
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      SweetAlert.handleNetworkError();
      return;
    }

    const { data, status } = error.response;
    
    // Handle validation errors
    if (data?.errors) {
      SweetAlert.handleValidationErrors(data.errors);
      return;
    }

    // Handle specific status codes
    switch (status) {
      case 400:
        SweetAlert.error('Invalid Request', data?.message || 'Please check your input and try again.');
        break;
      case 401:
        SweetAlert.error('Authentication Required', 'Please log in to continue.');
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;
      case 403:
        SweetAlert.error('Access Denied', data?.message || 'You don\'t have permission to perform this action.');
        break;
      case 404:
        SweetAlert.error('Not Found', data?.message || 'The requested resource was not found.');
        break;
      case 409:
        SweetAlert.warning('Conflict', data?.message || 'This action conflicts with existing data.');
        break;
      case 422:
        SweetAlert.warning('Validation Error', data?.message || 'Please check your input and try again.');
        break;
      case 429:
        SweetAlert.warning('Too Many Requests', 'You\'re doing that too frequently. Please wait a moment and try again.');
        break;
      case 500:
        SweetAlert.error('Server Error', 'We\'re experiencing technical difficulties. Please try again later.');
        break;
      case 503:
        SweetAlert.error('Service Unavailable', 'The service is temporarily unavailable. Please try again later.');
        break;
      default:
        SweetAlert.error('Error', data?.message || 'An unexpected error occurred.');
    }
  }, []);

  const handleSuccess = useCallback((message: string, title = 'Success') => {
    SweetAlert.success(title, message);
  }, []);

  const handleLoading = useCallback((title: string, message?: string) => {
    SweetAlert.loading(title, message);
  }, []);

  const handleConfirm = useCallback((title: string, message?: string, confirmText?: string, cancelText?: string) => {
    return SweetAlert.confirm(title, message, confirmText, cancelText);
  }, []);

  const closeAlert = useCallback(() => {
    SweetAlert.close();
  }, []);

  return {
    handleError,
    handleSuccess,
    handleLoading,
    handleConfirm,
    closeAlert
  };
};

export default useErrorHandler;