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

app.post('/sales', async (req, res) => {
    const { productId, quantity, totalPrice } = req.body;
    try {
        const sale = await prisma.sale.create({
            data: {
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                totalPrice: parseFloat(totalPrice),
            },
        });
        res.status(201).json(sale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating sale' });
    }
});

app.listen(port, () => {
    console.log(`Sales Service listening on port ${port}`);
});
