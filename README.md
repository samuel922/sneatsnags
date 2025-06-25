# AutoMatch Tickets Backend

A reverse marketplace for ticket resales where buyers post offers and sellers accept them.

## Features

- 🔐 Complete authentication system (signup, signin, email verification, password reset)
- 📊 Comprehensive database schema with Prisma ORM
- 🐳 Docker containerization
- 🚀 Express.js with TypeScript
- 📝 Swagger API documentation
- 🔒 JWT-based authentication
- 📧 Email service integration
- 🛡️ Security middleware (helmet, cors, rate limiting)
- 📋 Input validation with Zod
- 🗃️ PostgreSQL database
- 📦 Redis for caching
- 🎯 Structured for broker integrations

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd automatch-tickets-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start with Docker**

   ```bash
   docker-compose up -d
   ```

5. **Setup database**

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api-docs`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Other Endpoints (Placeholder)

- `/api/users` - User management
- `/api/events` - Event management
- `/api/offers` - Offer management
- `/api/listings` - Listing management
- `/api/transactions` - Transaction management
- `/api/brokers` - Broker integration management

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User** - User accounts with role-based access
- **Event** - Ticket events with venue information
- **Offer** - Buyer offers for tickets
- **Listing** - Seller ticket listings
- **Transaction** - Completed ticket sales
- **BrokerIntegration** - External broker system integrations

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Email verification
- Password reset functionality

## Broker Integration Ready

The backend is architected to support broker integrations:

- FTP sync capabilities
- Multiple data source support
- Flexible field mapping
- Audit logging
- Conflict resolution
- Scheduled synchronization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

This project is proprietary software for AutoMatch Tickets.));
};
