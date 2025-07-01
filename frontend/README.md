# AutoMatch Tickets - Frontend

A React + TypeScript + Tailwind CSS frontend application for the AutoMatch Tickets platform.

## Features

- **Authentication**: Login, registration, and JWT-based authentication
- **Role-based Access Control**: Different interfaces for Buyers, Sellers, Brokers, and Admins
- **Event Management**: Browse and search events
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Modern Stack**: Built with Vite for fast development

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form + Zod** - Form handling and validation
- **TanStack Query** - API state management
- **Axios** - HTTP client
- **Vite** - Build tool

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── ui/             # Basic UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## User Roles

- **Buyer**: Can create offers to buy tickets
- **Seller**: Can create listings to sell tickets
- **Broker**: Can integrate external ticket sources
- **Admin**: Full platform management access

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (optional)

## Development

The frontend automatically handles:
- JWT token refresh
- Role-based route protection
- API error handling
- Loading states
- Form validation

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.