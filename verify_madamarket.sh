#!/bin/bash

# Base URLs
USER_SERVICE="http://localhost:3003"
PRODUCT_SERVICE="http://localhost:3001"
SALES_SERVICE="http://localhost:3002"

echo "1. Registering Merchant..."
REGISTER_RES=$(curl -s -X POST "$USER_SERVICE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant@test.com", "password": "password123", "name": "Test Merchant", "role": "MERCHANT", "phone": "0341234567"}')
echo $REGISTER_RES

echo -e "\n2. Logging in Merchant..."
LOGIN_RES=$(curl -s -X POST "$USER_SERVICE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant@test.com", "password": "password123"}')
echo $LOGIN_RES
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
MERCHANT_ID=$(echo $LOGIN_RES | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
  echo "Login failed, cannot proceed."
  exit 1
fi

echo -e "\n3. Creating Product..."
PRODUCT_RES=$(curl -s -X POST "$PRODUCT_SERVICE/products" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Mada Vanilla\", \"description\": \"Best vanilla\", \"price\": 100, \"stock\": 50, \"merchantId\": $MERCHANT_ID}")
echo $PRODUCT_RES
PRODUCT_ID=$(echo $PRODUCT_RES | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo -e "\n4. Fetching Merchant Products..."
curl -s "$PRODUCT_SERVICE/products/merchant/$MERCHANT_ID"

echo -e "\n5. Creating Sale (Checkout)..."
SALE_RES=$(curl -s -X POST "$SALES_SERVICE/sales" \
  -H "Content-Type: application/json" \
  -d "{\"productId\": $PRODUCT_ID, \"quantity\": 2, \"mvolaNumber\": \"0341234567\"}")
echo $SALE_RES

echo -e "\n6. Fetching Merchant Sales..."
curl -s "$SALES_SERVICE/sales/merchant/$MERCHANT_ID"
