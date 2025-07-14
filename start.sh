#!/bin/bash

# Wait for database to be ready
echo "Waiting for database connection..."
sleep 5

# Generate Prisma Client
echo "Generating Prisma Client..."
cd backend && npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database if needed (only for initial setup)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
fi

# Start the application
echo "Starting the application..."
npm start