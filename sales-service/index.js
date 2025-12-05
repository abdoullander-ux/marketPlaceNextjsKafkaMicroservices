const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Kafka } = require('kafkajs');
const { authenticateKeycloak } = require('../shared/keycloak-middleware');
const { requireOwner, requireAnyGroup, requireMerchantOrOwner } = require('../shared/authorization-middleware');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3002;

app.use(express.json());

// Kafka Setup
const kafka = new Kafka({
    clientId: 'sales-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'sales-group' });

async function connectKafka() {
    try {
        await consumer.connect();
        console.log('Connected to Kafka');
        await consumer.subscribe({ topic: 'product-created', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const product = JSON.parse(message.value.toString());
                console.log(`Received ProductCreated event: ${product.name}`);
                // Here we could update a local cache or ProductReplica table
            },
        });
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

connectKafka();

// Routes - Protected (owners only can see all sales)
app.get('/sales', authenticateKeycloak, requireOwner, async (req, res) => {
    try {
        const sales = await prisma.sale.findMany();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
});

// Mock MVola Payment
async function processPayment(phoneNumber, amount) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 90% success rate
    return Math.random() < 0.9;
}

// Create sale - Protected (clients and owners)
app.post('/sales', authenticateKeycloak, requireAnyGroup(['client', 'owner']), async (req, res) => {
    const { productId, quantity, mvolaNumber } = req.body;
    try {
        // Fetch product details from product-service
        const productRes = await fetch(`http://product-service:3001/products/${productId}`);
        if (!productRes.ok) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const product = await productRes.json();

        const totalPrice = product.discountPrice ? product.discountPrice * quantity : product.price * quantity;
        const commissionRate = 0.05; // 5% default
        const commission = totalPrice * commissionRate;
        const merchantId = product.merchantId || "1";

        // Process Payment
        const paymentSuccess = await processPayment(mvolaNumber, totalPrice);
        const status = paymentSuccess ? 'COMPLETED' : 'FAILED';

        if (!paymentSuccess) {
            return res.status(400).json({ error: 'Payment failed' });
        }

        const sale = await prisma.sale.create({
            data: {
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                totalPrice: parseFloat(totalPrice),
                merchantId: merchantId,
                commission: parseFloat(commission),
                status: status,
                mvolaNumber: mvolaNumber,
                customerId: req.user.id // Add customer ID from token
            },
        });

        res.status(201).json(sale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating sale' });
    }
});

// Get sales by merchant - Protected (merchants can see their own, owners can see all)
app.get('/sales/merchant/:merchantId', authenticateKeycloak, requireMerchantOrOwner, async (req, res) => {
    try {
        const requestedMerchantId = req.params.merchantId;
        const userGroups = req.user.groups || [];
        const isOwner = userGroups.some(g => g === '/owner' || g === 'owner');

        // If not owner, can only see own sales
        if (!isOwner && req.user.id !== requestedMerchantId) {
            return res.status(403).json({ error: 'You can only view your own sales' });
        }

        const sales = await prisma.sale.findMany({
            where: { merchantId: requestedMerchantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching merchant sales' });
    }
});

// Update Order Status
app.put('/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, orderStatus } = req.body;
    try {
        const data = {};
        if (status) data.status = status;
        if (orderStatus) data.orderStatus = orderStatus;

        const sale = await prisma.sale.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get Orders for Merchant
app.get('/orders/merchant/:merchantId', async (req, res) => {
    const { merchantId } = req.params;
    try {
        const sales = await prisma.sale.findMany({
            where: { merchantId: merchantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch merchant orders' });
    }
});

app.listen(port, () => {
    console.log(`Sales Service listening at http://localhost:${port}`);
});
