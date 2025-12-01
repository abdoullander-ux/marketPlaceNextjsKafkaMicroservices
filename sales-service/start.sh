#!/bin/sh

echo "Waiting for MySQL to be ready..."
sleep 10

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting Sales Service..."
node index.js
