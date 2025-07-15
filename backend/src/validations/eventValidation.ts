import { z } from "zod";

// Enums for better type safety
export const EventType = z.enum(["SPORTS", "CONCERT", "THEATER", "COMEDY", "OTHER"]);
export const EventStatus = z.enum(["ACTIVE", "CANCELLED", "POSTPONED", "COMPLETED"]);

// Common validation patterns
const requiredString = z.string().min(1, "This field is required");
const optionalString = z.string().optional();
const positiveNumber = z.number().positive("Must be a positive number");
const optionalPositiveNumber = z.number().positive().optional();
const dateString = z.string().datetime("Invalid date format");
const optionalDateString = z.string().datetime().optional();

// Address validation schema
export const AddressValidationSchema = z.object({
  venue: requiredString.min(2, "Venue must be at least 2 characters").max(200, "Venue too long"),
  address: requiredString.min(5, "Address must be at least 5 characters").max(500, "Address too long"),
  city: requiredString.min(2, "City must be at least 2 characters").max(100, "City too long"),
  state: requiredString.min(2, "State must be at least 2 characters").max(100, "State too long"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format").or(z.string().min(3).max(10)), // Support international postal codes
  country: z.string().length(2, "Country code must be 2 characters").default("US"),
});

// Section validation schema
export const SectionValidationSchema = z.object({
  name: requiredString.min(1, "Section name is required").max(100, "Section name too long"),
  description: optionalString,
  rowCount: optionalPositiveNumber,
  seatCount: optionalPositiveNumber,
  priceLevel: z.number().int().min(1).max(10).optional(),
}).refine((data) => {
  // At least one capacity indicator should be provided
  return data.rowCount || data.seatCount;
}, {
  message: "Either row count or seat count must be provided",
  path: ["seatCount"],
});

// Price validation schema
export const PriceValidationSchema = z.object({
  minPrice: z.number().min(0, "Minimum price cannot be negative").optional(),
  maxPrice: z.number().min(0, "Maximum price cannot be negative").optional(),
}).refine((data) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "Minimum price cannot be greater than maximum price",
  path: ["maxPrice"],
});

// Event creation validation schema
export const CreateEventValidationSchema = z.object({
  // Basic event information
  name: requiredString
    .min(3, "Event name must be at least 3 characters")
    .max(200, "Event name too long")
    .regex(/^[a-zA-Z0-9\s\-:()&.,'!]+$/, "Event name contains invalid characters"),
  
  description: z.string()
    .max(2000, "Description too long")
    .optional(),
  
  // Event classification
  eventType: EventType,
  category: optionalString,
  subcategory: optionalString,
  
  // Location validation
  ...AddressValidationSchema.shape,
  
  // Date and time validation
  eventDate: z.string().datetime("Invalid event date format")
    .transform((str) => new Date(str))
    .refine((date) => date > new Date(), {
      message: "Event date must be in the future",
    }),
  
  doors: z.string().datetime("Invalid doors time format")
    .transform((str) => new Date(str))
    .optional(),
  
  // Capacity and pricing
  totalSeats: optionalPositiveNumber,
  availableSeats: optionalPositiveNumber,
  ...PriceValidationSchema.shape,
  
  // Media and external data
  imageUrl: z.string().url("Invalid image URL").optional(),
  ticketmasterId: z.string().optional(),
  
  // Sections
  sections: z.array(SectionValidationSchema)
    .min(1, "At least one section is required")
    .max(50, "Too many sections"),
    
  // Status
  status: EventStatus.default("ACTIVE"),
  isActive: z.boolean().default(true),
})
.refine((data) => {
  // Validate doors time is before event time
  if (data.doors) {
    return data.doors < data.eventDate;
  }
  return true;
}, {
  message: "Doors time must be before event time",
  path: ["doors"],
})
.refine((data) => {
  // Validate total seats consistency
  if (data.totalSeats && data.availableSeats) {
    return data.availableSeats <= data.totalSeats;
  }
  return true;
}, {
  message: "Available seats cannot exceed total seats",
  path: ["availableSeats"],
});

// Event update validation schema
export const UpdateEventValidationSchema = CreateEventValidationSchema.partial()
  .omit({ sections: true }) // Sections are updated separately
  .refine((data) => {
    // At least one field should be provided for update
    return Object.keys(data).length > 0;
  }, {
    message: "At least one field must be provided for update",
  });

// Event search validation schema
export const EventSearchValidationSchema = z.object({
  // Pagination
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
  
  // Sorting
  sortBy: z.enum(["eventDate", "name", "createdAt", "minPrice", "maxPrice"]).default("eventDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  
  // Filters
  city: optionalString,
  state: optionalString,
  eventType: EventType.optional(),
  category: optionalString,
  subcategory: optionalString,
  
  // Date range
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
  
  // Price range
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  
  // Search query
  search: optionalString,
  
  // Status filter
  status: EventStatus.optional(),
  isActive: z.string().transform((val) => val === "true").optional(),
})
.refine((data) => {
  // Validate date range
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: "Date from cannot be after date to",
  path: ["dateTo"],
})
.refine((data) => {
  // Validate price range
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "Minimum price cannot be greater than maximum price",
  path: ["maxPrice"],
});

// Section creation validation schema
export const CreateSectionValidationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  ...SectionValidationSchema.shape,
});

// Section update validation schema
export const UpdateSectionValidationSchema = SectionValidationSchema.partial()
  .refine((data) => {
    return Object.keys(data).length > 0;
  }, {
    message: "At least one field must be provided for update",
  });

// Event ID validation schema
export const EventIdValidationSchema = z.object({
  id: z.string().uuid("Invalid event ID"),
});

// Bulk operations validation schema
export const BulkEventOperationSchema = z.object({
  eventIds: z.array(z.string().uuid("Invalid event ID"))
    .min(1, "At least one event ID is required")
    .max(100, "Too many events in bulk operation"),
  operation: z.enum(["activate", "deactivate", "delete"]),
});

// Event statistics query validation schema
export const EventStatsValidationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
});

// Export type definitions
export type CreateEventRequest = z.infer<typeof CreateEventValidationSchema>;
export type UpdateEventRequest = z.infer<typeof UpdateEventValidationSchema>;
export type EventSearchQuery = z.infer<typeof EventSearchValidationSchema>;
export type CreateSectionRequest = z.infer<typeof CreateSectionValidationSchema>;
export type UpdateSectionRequest = z.infer<typeof UpdateSectionValidationSchema>;
export type BulkEventOperation = z.infer<typeof BulkEventOperationSchema>;
export type EventStatsQuery = z.infer<typeof EventStatsValidationSchema>;