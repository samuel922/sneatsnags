# Offer Components

This directory contains React components for creating and managing ticket offers by buyers.

## Components

### CreateOfferForm
A comprehensive form component for creating new offers with intelligent price suggestions.

**Features:**
- Smart price suggestions based on market data
- Section selection for venue preferences  
- Quantity and expiration date selection
- Real-time price analysis and recommendations
- Form validation with Zod schema

**Usage:**
```tsx
import { CreateOfferForm } from '../components/offers/CreateOfferForm';

<CreateOfferForm
  event={event}
  onSuccess={(offer) => console.log('Offer created:', offer)}
  onCancel={() => setShowForm(false)}
/>
```

### CreateOfferModal
A modal wrapper for the CreateOfferForm component.

**Usage:**
```tsx
import { CreateOfferModal } from '../components/offers/CreateOfferModal';

<CreateOfferModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  event={event}
  onSuccess={(offer) => {
    console.log('Offer created:', offer);
    setShowModal(false);
  }}
/>
```

### OffersList
Displays a list of offers with filtering options.

**Usage:**
```tsx
import { OffersList } from '../components/offers/OffersList';

// Show all offers for an event
<OffersList eventId="event-123" />

// Show user's own offers
<OffersList showUserOffersOnly={true} />

// Show recent offers
<OffersList limit={5} />
```

## Price Suggestion Algorithm

The price suggestion system analyzes:
- Historical offer data for the event
- Recent market trends
- Section-specific pricing
- Successful acceptance rates
- Listing prices for comparison

**Calculation Method:**
1. Fetches recent active offers for the event
2. Filters by selected sections (if any)
3. Calculates percentile-based suggestions:
   - Suggested Price: 75th percentile of recent offers
   - Competitive Range: 25th to 90th percentile
   - Average and median for reference
4. Falls back to listing price analysis if no offer data

## Services

### offerService
Provides all API interactions for offers:

```tsx
import { offerService } from '../../services/offerService';

// Create offer
const offer = await offerService.createOffer({
  eventId: 'event-123',
  sectionIds: ['section-1', 'section-2'],
  maxPrice: 150,
  quantity: 2,
  message: 'Looking for great seats!',
  expiresAt: '2024-01-15T00:00:00Z'
});

// Get price suggestions
const suggestions = await offerService.getPriceSuggestions('event-123', ['section-1']);

// Get user's offers
const myOffers = await offerService.getMyOffers();
```

## Types

### Key Interfaces
- `CreateOfferRequest`: API request format
- `Offer`: Complete offer object
- `PriceSuggestion`: Price analysis data
- `OfferStatus`: 'ACTIVE' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'

## Integration Examples

### In an Event Detail Page
```tsx
import { CreateOfferModal } from '../components/offers';

function EventDetailPage() {
  const [showOfferModal, setShowOfferModal] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setShowOfferModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Make an Offer
      </button>
      
      <CreateOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        event={event}
        onSuccess={(offer) => {
          setShowOfferModal(false);
          // Redirect to offer success page or show confirmation
        }}
      />
    </div>
  );
}
```

### In a User Dashboard
```tsx
import { OffersList } from '../components/offers';

function UserDashboard() {
  return (
    <div>
      <h2>My Offers</h2>
      <OffersList showUserOffersOnly={true} />
    </div>
  );
}
```

### As a Standalone Page
```tsx
import { CreateOfferPage } from '../pages/CreateOfferPage';

// Route: /events/:eventId/offer
// The page will automatically load the event and show the form
```

## Styling

Components use Tailwind CSS classes and are designed to be:
- Responsive across all screen sizes
- Accessible with proper ARIA labels
- Consistent with the app's design system
- Easy to customize with additional props

## Dependencies

- React Hook Form for form management
- Zod for validation
- React Router for navigation
- Tailwind CSS for styling
- Custom API client for backend communication