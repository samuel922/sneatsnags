# Use official Node.js runtime with Debian base for better compatibility
FROM node:22-slim

# Install OpenSSL and cleaning up caches
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies reproducibly and global TS tooling
RUN npm ci && \
    npm install -g ts-node tsx

# Copy Prisma schema and generate the client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application code
COPY . .

# Expose application port
EXPOSE 5001

# Start in development mode using nodemon with TS support
CMD ["npm", "run", "dev"]