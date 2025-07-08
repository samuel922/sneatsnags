# SweetAlert2 Integration

This project includes SweetAlert2 for user-friendly error messages and notifications.

## Files Added

### 1. `utils/sweetAlert.ts`
Main utility class for SweetAlert2 with methods for:
- `success()` - Success notifications
- `error()` - Error messages
- `warning()` - Warning messages
- `info()` - Information messages
- `confirm()` - Confirmation dialogs
- `loading()` - Loading indicators
- `toast()` - Toast notifications
- `handleApiError()` - API error handler
- `handleValidationErrors()` - Validation error handler
- `handleNetworkError()` - Network error handler

### 2. `hooks/useErrorHandler.ts`
React hook for handling errors consistently across components:
- Automatic error categorization by HTTP status codes
- Network error detection
- Validation error handling
- Success message display

### 3. `services/listingServiceWithAlerts.ts`
Wrapper service that combines listing API calls with SweetAlert notifications:
- Automatic error handling for all listing operations
- Loading indicators for async operations
- Success confirmations
- File validation for uploads

### 4. `styles/sweetAlert.css`
Custom CSS styles for SweetAlert2 modals:
- Consistent design with the app theme
- Dark mode support
- Custom animations and transitions
- Responsive design

## Usage Examples

### Basic Usage
```typescript
import SweetAlert from '../utils/sweetAlert';

// Success message
SweetAlert.success('Success!', 'Operation completed successfully');

// Error message
SweetAlert.error('Error', 'Something went wrong');

// Confirmation dialog
const result = await SweetAlert.confirm('Delete Item?', 'This cannot be undone');
if (result.isConfirmed) {
  // User confirmed
}
```

### Using the Error Handler Hook
```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, handleSuccess } = useErrorHandler();

  const handleApiCall = async () => {
    try {
      const result = await someApiCall();
      handleSuccess('Operation completed successfully');
    } catch (error) {
      handleError(error);
    }
  };
};
```

### Using the Service with Alerts
```typescript
import { listingServiceWithAlerts } from '../services/listingServiceWithAlerts';

const MyComponent = () => {
  const createListing = async (data) => {
    // This will automatically show loading, success, and error alerts
    const result = await listingServiceWithAlerts.createListing(data);
    if (result) {
      // Success - alert already shown
      // Handle success logic
    }
    // Error handling is automatic
  };
};
```

## Backend Error Messages

The backend controllers have been updated with user-friendly error messages:

### Improved Error Handling
- **Validation errors**: Clear, actionable error messages
- **Authentication errors**: Helpful guidance for login issues
- **Authorization errors**: Clear permission messages
- **Business logic errors**: Context-specific error messages
- **Server errors**: User-friendly technical difficulty messages

### Error Categories
- **400 Bad Request**: Invalid input with specific guidance
- **401 Unauthorized**: Authentication required messages
- **403 Forbidden**: Permission denied explanations
- **404 Not Found**: Resource not found messages
- **409 Conflict**: Duplicate resource explanations
- **500 Server Error**: Technical difficulty messages

## Styling

The SweetAlert2 modals are styled to match the application's design:
- Uses the same color scheme as the app
- Consistent typography and spacing
- Smooth animations and transitions
- Responsive design for mobile devices
- Dark mode support

## Best Practices

1. **Use specific error messages**: Avoid generic "Something went wrong" messages
2. **Provide actionable guidance**: Tell users what they can do to fix the issue
3. **Show loading states**: Use loading indicators for async operations
4. **Confirm destructive actions**: Use confirmation dialogs for delete operations
5. **Handle network errors**: Provide specific guidance for connectivity issues
6. **Validate input**: Show validation errors immediately and clearly
7. **Use appropriate alert types**: Success, error, warning, info based on context

## Configuration

SweetAlert2 can be configured globally in the `sweetAlert.ts` file:
- Default timers for toast notifications
- Custom button colors and text
- Animation preferences
- Position settings for toast messages

The styles can be customized in `styles/sweetAlert.css` to match your design system.