# Professional Event Management System V2

## Overview

This is a comprehensive, production-ready event management system with robust validation, error handling, transaction support, and comprehensive logging. The system is designed to handle high-traffic scenarios with proper rate limiting and security measures.

## Architecture

### Core Components

1. **Validation Layer** (`src/validations/eventValidation.ts`)
   - Comprehensive Zod schemas for all event operations
   - Type-safe validation with detailed error messages
   - Business rule validation (dates, capacity, pricing)

2. **Error Handling** (`src/errors/eventErrors.ts`)
   - Custom error types for different scenarios
   - Structured error responses with proper HTTP status codes
   - Error context preservation for debugging

3. **Service Layer** (`src/services/eventService.v2.ts`)
   - Transaction-based operations with rollback capability
   - Comprehensive business logic validation
   - Duplicate detection and conflict resolution
   - Performance monitoring and logging

4. **Controller Layer** (`src/controllers/eventController.v2.ts`)
   - Request/response handling with proper status codes
   - Comprehensive logging and monitoring
   - Request ID tracking for debugging
   - Standardized API responses

5. **Middleware Layer** (`src/middlewares/eventValidation.ts`)
   - Request validation and sanitization
   - Rate limiting and security measures
   - Authorization and permission checks
   - Content type and file size validation

6. **Route Layer** (`src/routes/event.v2.ts`)
   - RESTful API design with proper HTTP methods
   - Graduated rate limiting based on operation type
   - Public and admin-only endpoints
   - Health check endpoints

## Key Features

### 1. Comprehensive Validation
- **Schema Validation**: Zod schemas for type safety and validation
- **Business Rule Validation**: Event date constraints, capacity limits, pricing rules
- **Data Sanitization**: XSS prevention and input cleaning
- **Duplicate Detection**: Prevents duplicate events based on name, venue, and date

### 2. Robust Error Handling
- **Structured Errors**: Custom error types with proper HTTP status codes
- **Context Preservation**: Error details for debugging and monitoring
- **Graceful Degradation**: Fallback responses for unexpected errors
- **Validation Feedback**: Detailed validation error messages

### 3. Transaction Support
- **Atomic Operations**: Database transactions with rollback capability
- **Consistency Guarantees**: Ensures data integrity across operations
- **Rollback on Failure**: Automatic rollback on any operation failure
- **Conflict Resolution**: Handles concurrent access scenarios

### 4. Performance & Monitoring
- **Request Tracking**: Unique request IDs for debugging
- **Performance Metrics**: Response time tracking and logging
- **Comprehensive Logging**: Structured logging for operations and errors
- **Health Checks**: System health monitoring endpoints

### 5. Security & Rate Limiting
- **Graduated Rate Limiting**: Different limits for different operations
- **IP-based Limiting**: Prevents abuse from individual IPs
- **User-based Limiting**: Per-user rate limiting for authenticated requests
- **Admin Protection**: Special rate limits for admin operations

### 6. Professional API Design
- **RESTful Design**: Standard HTTP methods and status codes
- **Consistent Responses**: Standardized response format
- **Pagination Support**: Efficient data retrieval with pagination
- **Search & Filtering**: Advanced search capabilities

## API Endpoints

### Public Endpoints
- `GET /api/events` - Get events with filtering and pagination
- `GET /api/events/search` - Search events
- `GET /api/events/popular` - Get popular events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id` - Get single event
- `GET /api/events/:id/stats` - Get event statistics

### Admin Endpoints (Authentication Required)
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Health Check
- `GET /api/events/health/check` - Service health check

## Rate Limiting

### Public Endpoints
- Events listing: 100 requests/minute
- Search: 50 requests/minute
- Popular/Upcoming: 30 requests/minute
- Single event: 200 requests/minute

### Admin Endpoints
- Create events: 10 requests/minute
- Update events: 20 requests/minute
- Delete events: 5 requests/minute

## Error Codes

- `EVENT_VALIDATION_ERROR` (400) - Request validation failed
- `EVENT_NOT_FOUND` (404) - Event not found
- `EVENT_ALREADY_EXISTS` (409) - Duplicate event
- `EVENT_OPERATION_NOT_ALLOWED` (403) - Operation not permitted
- `EVENT_DATE_CONFLICT` (409) - Date/time conflicts
- `EVENT_CAPACITY_ERROR` (400) - Capacity validation failed
- `EVENT_BUSINESS_LOGIC_ERROR` (422) - Business rule violation
- `EVENT_PERMISSION_ERROR` (403) - Permission denied
- `RATE_LIMIT_EXCEEDED` (429) - Rate limit exceeded

## Usage Examples

### Create Event
```json
POST /api/events
{
  "name": "Taylor Swift Concert",
  "eventType": "CONCERT",
  "venue": "Madison Square Garden",
  "address": "4 Pennsylvania Plaza",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "eventDate": "2024-12-25T20:00:00Z",
  "doors": "2024-12-25T19:00:00Z",
  "totalSeats": 20000,
  "minPrice": 50,
  "maxPrice": 500,
  "sections": [
    {
      "name": "VIP",
      "seatCount": 1000,
      "priceLevel": 1
    },
    {
      "name": "General Admission",
      "seatCount": 19000,
      "priceLevel": 2
    }
  ]
}
```

### Search Events
```
GET /api/events/search?q=taylor+swift&city=new+york&eventType=CONCERT&limit=10
```

### Get Events with Filters
```
GET /api/events?city=new+york&eventType=CONCERT&dateFrom=2024-01-01&dateTo=2024-12-31&minPrice=50&maxPrice=200&page=1&limit=20
```

## Migration Guide

To use the new event system:

1. **Update Routes**: Replace the old event routes with the new ones
2. **Update Imports**: Import from the new controller and service files
3. **Update Validation**: Use the new validation middleware
4. **Update Error Handling**: Handle the new error types
5. **Update Frontend**: Adapt to the new response format

## Configuration

### Environment Variables
```
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
MAX_EVENTS_PER_VENUE_PER_DAY=10
MAX_SECTIONS_PER_EVENT=50
```

### Database Configuration
Ensure your database supports transactions for the rollback functionality.

## Testing

The system includes comprehensive validation and error handling that makes testing straightforward:

1. **Unit Tests**: Test individual validation schemas and service methods
2. **Integration Tests**: Test complete API workflows
3. **Error Scenarios**: Test various error conditions and rollback scenarios
4. **Performance Tests**: Test rate limiting and performance under load

## Monitoring & Observability

- **Structured Logging**: All operations logged with context
- **Request Tracking**: Unique request IDs for tracing
- **Performance Metrics**: Response time and operation duration
- **Error Tracking**: Detailed error logs with context
- **Health Checks**: System health monitoring

## Security Considerations

- **Input Validation**: Comprehensive validation and sanitization
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Authentication**: Admin operations require authentication
- **Authorization**: Role-based access control
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **XSS Prevention**: Input sanitization and output encoding

This system provides a robust, scalable, and maintainable foundation for event management with professional-grade features and security measures.