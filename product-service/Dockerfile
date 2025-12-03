FROM node:20-alpine

# Install OpenSSL and libc6-compat for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy shared middleware
COPY shared /app/shared

# Create product-service directory
WORKDIR /app/product-service

# Copy package files
COPY product-service/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY product-service .

# Generate Prisma Client
RUN npx prisma generate

# Make start script executable
RUN chmod +x start.sh

EXPOSE 3001

CMD ["sh", "start.sh"]
