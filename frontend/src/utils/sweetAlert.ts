import Swal from 'sweetalert2';

export class SweetAlert {
  // Success alerts
  static success(title: string, message?: string, timer = 3000) {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      timer,
      showConfirmButton: false,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: 'colored-toast'
      }
    });
  }

  // Error alerts
  static error(title: string, message?: string) {
    return Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc3545',
      customClass: {
        popup: 'error-popup'
      }
    });
  }

  // Warning alerts
  static warning(title: string, message?: string) {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#ffc107',
      customClass: {
        popup: 'warning-popup'
      }
    });
  }

  // Info alerts
  static info(title: string, message?: string) {
    return Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#17a2b8',
      customClass: {
        popup: 'info-popup'
      }
    });
  }

  // Confirmation dialogs
  static confirm(title: string, message?: string, confirmText = 'Yes', cancelText = 'No') {
    return Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      customClass: {
        popup: 'confirm-popup'
      }
    });
  }

  // Loading alerts
  static loading(title: string, message?: string) {
    return Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'loading-popup'
      }
    });
  }

  // Close any open alert
  static close() {
    Swal.close();
  }

  // Toast notifications
  static toast(icon: 'success' | 'error' | 'warning' | 'info', title: string, timer = 3000) {
    return Swal.fire({
      icon,
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast'
      }
    });
  }

  // API Error handler
  static handleApiError(error: any) {
    const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
    const title = error?.response?.status === 500 ? 'Server Error' : 'Error';
    
    this.error(title, message);
  }

  // Validation error handler
  static handleValidationErrors(errors: Record<string, string[]>) {
    const errorMessages = Object.values(errors).flat();
    const message = errorMessages.length > 1 
      ? errorMessages.join('\n') 
      : errorMessages[0];
    
    this.error('Validation Error', message);
  }

  // Network error handler
  static handleNetworkError() {
    this.error(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  // Success with redirect
  static successWithRedirect(title: string, message: string, redirectPath: string, timer = 2000) {
    this.success(title, message, timer);
    
    setTimeout(() => {
      window.location.href = redirectPath;
    }, timer);
  }

  // Delete confirmation
  static deleteConfirmation(itemName: string = 'item') {
    return this.confirm(
      `Delete ${itemName}?`,
      `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      'Delete',
      'Cancel'
    );
  }
}

export default SweetAlert;