FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy shared middleware
COPY shared /app/shared

# Create sales-service directory
WORKDIR /app/sales-service

# Copy package files
COPY sales-service/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY sales-service .

# Generate Prisma Client
RUN npx prisma generate

# Make start script executable
RUN chmod +x start.sh

EXPOSE 3002

CMD ["sh", "start.sh"]
