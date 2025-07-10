# Railway Deployment Guide

## Overview
Railway is the best choice for SneatSnags because it provides:
- Single platform for full-stack deployment
- Built-in PostgreSQL and Redis
- Automatic deployments from Git
- Excellent performance and scaling
- Simple environment variable management

## 🚀 Quick Deploy

### 1. Prerequisites
- Push your code to GitHub/GitLab
- Create a Railway account at [railway.app](https://railway.app)
- Install Railway CLI: `npm install -g @railway/cli`

### 2. Deploy Backend
```bash
# Login to Railway
railway login

# Navigate to backend
cd backend

# Deploy backend service
railway deploy

# Add PostgreSQL database
railway add postgresql

# Set environment variables (see section below)
```

### 3. Deploy Frontend
```bash
# Navigate to frontend
cd frontend

# Deploy frontend service
railway deploy

# Link to backend service for environment variables
```

## 🔧 Environment Variables

### Backend Service
Set these in Railway dashboard:

**Required:**
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate: `openssl rand -base64 32`
- `HMAC_VERIFICATION_CODE_SECRET` - Generate: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

**Email Configuration:**
- `SMTP_USER` - Your email address
- `SMTP_PASS` - Your email password/app password
- `FROM_EMAIL` - Your from email address

**Optional:**
- `TICKETMASTER_API_KEY` - Ticketmaster API key
- `TICKETMASTER_API_SECRET` - Ticketmaster API secret

### Frontend Service
Set these in Railway dashboard:
- `RAILWAY_BACKEND_URL` - Will be auto-populated with backend service URL

## 📁 Project Structure
```
sneatsnags/
├── backend/           # Backend service
│   ├── railway.json   # Railway backend config
│   └── .env.railway   # Environment template
├── frontend/          # Frontend service
│   ├── railway.json   # Railway frontend config
│   └── .env.railway   # Environment template
└── railway.json       # Root config
```

## 🛠 Railway Configuration

### Backend (`backend/railway.json`)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### Frontend (`frontend/railway.json`)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview"
  }
}
```

## 🔄 Deployment Process

### Automatic Deployment
1. Push to your Git repository
2. Railway automatically deploys both services
3. Database migrations run automatically
4. Services are available at generated URLs

### Manual Deployment
```bash
# Backend
cd backend
railway deploy

# Frontend
cd frontend
railway deploy
```

## 🗄 Database Setup

### PostgreSQL
Railway automatically provides:
- `DATABASE_URL` environment variable
- Connection pooling
- Automatic backups
- Monitoring dashboard

### Run Migrations
```bash
# After first deployment
railway run npx prisma migrate deploy

# Or use the custom script
railway run npm run railway:deploy
```

## 🔗 Service URLs
After deployment, you'll get:
- **Backend**: `https://your-backend-service.railway.app`
- **Frontend**: `https://your-frontend-service.railway.app`
- **Database**: Automatically connected via `DATABASE_URL`

## 📊 Monitoring & Scaling

### Railway Dashboard
- Real-time metrics
- Resource usage
- Deployment history
- Environment variables
- Database management

### Scaling
- Automatic scaling based on traffic
- Manual scaling controls
- Resource allocation settings

## 🔧 Local Development

### Environment Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Link to your Railway project
railway link

# Pull environment variables
railway variables

# Run locally with Railway environment
railway run npm run dev
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Railway dashboard
   - Verify package.json scripts
   - Ensure all dependencies are listed

2. **Database Connection**
   - Verify DATABASE_URL is set
   - Check Prisma schema
   - Run migrations: `railway run npx prisma migrate deploy`

3. **Environment Variables**
   - Check all required variables are set
   - Verify variable names match exactly
   - Use Railway CLI to debug: `railway variables`

4. **CORS Issues**
   - Update CORS configuration in backend
   - Add Railway domain to allowed origins

### Debugging Commands
```bash
# View logs
railway logs

# Run commands in Railway environment
railway run <command>

# Check environment variables
railway variables

# Connect to database
railway connect postgresql
```

## 💰 Pricing

### Starter Plan ($5/month)
- 512MB RAM, 1GB Storage
- Perfect for MVP and small applications
- Includes PostgreSQL database

### Pro Plan ($20/month)
- 8GB RAM, 100GB Storage
- Higher performance
- Priority support

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Railway's secret management
   - Rotate secrets regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **API Security**
   - Configure CORS properly
   - Use rate limiting
   - Validate all inputs

## 🎯 Production Checklist

- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] CORS configured for Railway domains
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] Monitoring set up
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Error tracking enabled

## 🚀 Go Live!

1. Push your code to Git
2. Connect repository to Railway
3. Deploy both services
4. Configure environment variables
5. Run database migrations
6. Test all functionality
7. Configure custom domain (optional)

Your SneatSnags platform will be live and ready to handle real users! 🎉