const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Kafka } = require('kafkajs');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3002;

app.use(cors());
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

// Routes
app.get('/sales', async (req, res) => {
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

app.post('/sales', async (req, res) => {
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
        const merchantId = product.merchantId || 1;

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
                mvolaNumber: mvolaNumber
            },
        });

        res.status(201).json(sale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating sale' });
    }
});

// Get sales by merchant
app.get('/sales/merchant/:merchantId', async (req, res) => {
    try {
        const sales = await prisma.sale.findMany({
            where: { merchantId: parseInt(req.params.merchantId) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching merchant sales' });
    }
});

app.listen(port, () => {
    console.log(`Sales Service listening on port ${port}`);
});
