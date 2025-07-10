FROM node:22-slim

# Install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl libssl-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && \
    npm install -g ts-node tsx

# Copy prisma schema first for better caching
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "run", "dev"]