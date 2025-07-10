# Deployment Guide

## Overview
SneatSnags is a full-stack ticket marketplace application that can be deployed on various platforms.

## Architecture
- **Frontend**: React/Vite application
- **Backend**: Node.js/Express API with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local file system (configurable)

## Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Domain name (optional)
- SSL certificate (recommended for production)

## Environment Variables

### Backend Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-frontend-domain.com

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=SneatSnags Platform

# Security
HMAC_VERIFICATION_CODE_SECRET=your-hmac-secret

# External API (optional)
TICKETMASTER_API_KEY=your-ticketmaster-api-key
TICKETMASTER_API_SECRET=your-ticketmaster-secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Build Instructions

### Backend
```bash
cd backend
npm install
npm run build
npx prisma generate
npx prisma migrate deploy
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

## Deployment Options

### 1. Traditional VPS/Server
- Use PM2 for process management
- Nginx as reverse proxy
- PostgreSQL installation
- SSL with Let's Encrypt

### 2. Cloud Platforms
- **Heroku**: Easy deployment with PostgreSQL add-on
- **Railway**: Modern platform with built-in PostgreSQL
- **Render**: Static sites and web services
- **DigitalOcean App Platform**: Managed container platform

### 3. Container Deployment
- Docker and Docker Compose
- Kubernetes clusters
- Cloud container services (AWS ECS, Azure Container Apps, GCP Cloud Run)

### 4. Serverless Options
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: AWS Lambda, Vercel Functions, Netlify Functions
- **Database**: PlanetScale, Neon, Supabase

## Security Considerations

### Environment Security
- Use strong, unique passwords
- Rotate JWT secrets regularly
- Store secrets securely (never in code)
- Use environment-specific configurations

### Application Security
- Enable CORS for specific domains only
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use secure headers (Helmet.js)

### Database Security
- Use connection pooling
- Enable SSL connections
- Regular backups
- Restrict database access

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize images and assets

### Backend
- Use connection pooling
- Implement Redis for caching
- Database query optimization
- Enable compression middleware

### Database
- Index frequently queried columns
- Use database connection pooling
- Regular maintenance and optimization
- Monitor query performance

## Support

### Documentation
- API documentation available at `/api-docs`
- Database schema in Prisma schema file
- Environment variable templates provided

This guide provides a comprehensive overview for deploying SneatSnags on any platform. Choose the deployment method that best fits your requirements, budget, and technical expertise.