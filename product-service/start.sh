#!/bin/sh

echo "Waiting for MySQL to be ready..."
sleep 10

echo "Pushing Prisma schema..."
npx prisma db push --accept-data-loss

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting Product Service..."
node index.js
