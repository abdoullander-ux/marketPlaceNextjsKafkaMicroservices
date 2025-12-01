const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Kafka } = require('kafkajs');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Kafka Setup
const kafka = new Kafka({
    clientId: 'product-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

async function connectKafka() {
    try {
        await producer.connect();
        console.log('Connected to Kafka');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

connectKafka();



async function seed() {
    const count = await prisma.product.count();
    if (count === 0) {
        console.log('Seeding database with products...');

        const products = [
            // Electronics
            {
                name: "Premium Smartphone Pro Max - Latest Model",
                description: "Experience the future with our flagship smartphone. Features include 6.7\" OLED display, 5G connectivity, triple camera system with 108MP main sensor, and all-day battery life.",
                price: 899.99,
                originalPrice: 1299.99,
                discountPrice: 899.99,
                rating: 4.8,
                reviewsCount: 2547,
                soldCount: 15234,
                stock: 150,
                category: "Electronics",
                brand: "TechPro",
                images: ["/images/products/phone.png"],
                colors: ["Black", "Silver", "Blue", "Gold"],
                sizes: ["128GB", "256GB", "512GB"],
                tags: ["trending", "bestseller", "5g"]
            },
            {
                name: "Ultra Slim Laptop - Professional Edition",
                description: "Powerful performance meets elegant design. Intel i7 processor, 16GB RAM, 512GB SSD, 14\" Full HD display. Perfect for work and entertainment.",
                price: 1199.99,
                originalPrice: 1599.99,
                discountPrice: 1199.99,
                rating: 4.7,
                reviewsCount: 1823,
                soldCount: 8945,
                stock: 85,
                category: "Electronics",
                brand: "CompuTech",
                images: ["/images/products/laptop.png"],
                colors: ["Silver", "Space Gray"],
                sizes: ["i5/8GB", "i7/16GB", "i9/32GB"],
                tags: ["new", "professional"]
            },
            {
                name: "Wireless Noise-Cancelling Headphones",
                description: "Premium sound quality with active noise cancellation. 30-hour battery life, comfortable over-ear design, and crystal-clear calls.",
                price: 249.99,
                originalPrice: 399.99,
                discountPrice: 249.99,
                rating: 4.6,
                reviewsCount: 3421,
                soldCount: 21456,
                stock: 200,
                category: "Electronics",
                brand: "AudioMax",
                images: ["/images/products/headphones.png"],
                colors: ["Black", "White", "Blue"],
                sizes: ["Standard"],
                tags: ["trending", "sale"]
            },
            {
                name: "Smartwatch Fitness Tracker Pro",
                description: "Track your health and fitness goals. Heart rate monitor, GPS, sleep tracking, waterproof design, and 7-day battery life.",
                price: 199.99,
                originalPrice: 299.99,
                discountPrice: 199.99,
                rating: 4.5,
                reviewsCount: 1567,
                soldCount: 12389,
                stock: 120,
                category: "Electronics",
                brand: "FitTech",
                images: ["/images/products/watch.png"],
                colors: ["Black", "Silver", "Rose Gold"],
                sizes: ["38mm", "42mm", "46mm"],
                tags: ["fitness", "trending"]
            },

            // Fashion
            {
                name: "Summer Floral Dress - Elegant Collection",
                description: "Beautiful floral pattern dress perfect for summer. Lightweight fabric, comfortable fit, and vibrant colors. Ideal for casual outings and special occasions.",
                price: 39.99,
                originalPrice: 79.99,
                discountPrice: 39.99,
                rating: 4.4,
                reviewsCount: 892,
                soldCount: 5678,
                stock: 250,
                category: "Fashion",
                brand: "StyleHub",
                images: ["/images/products/dress.png"],
                colors: ["Floral Blue", "Floral Pink", "Floral Yellow"],
                sizes: ["XS", "S", "M", "L", "XL"],
                tags: ["summer", "sale", "trending"],
                colorImages: {
                    "Floral Blue": ["/images/products/dress.png", "/images/products/sneakers.png"],
                    "Floral Pink": ["/images/products/backpack.png", "/images/products/chair.png"],
                    "Floral Yellow": ["/images/products/watch.png", "/images/products/laptop.png"]
                }
            },
            {
                name: "Premium Athletic Sneakers - Sport Edition",
                description: "High-performance sneakers designed for comfort and style. Breathable mesh upper, cushioned sole, and durable construction.",
                price: 79.99,
                originalPrice: 129.99,
                discountPrice: 79.99,
                rating: 4.7,
                reviewsCount: 2134,
                soldCount: 18923,
                stock: 300,
                category: "Fashion",
                brand: "SportMax",
                images: ["/images/products/sneakers.png"],
                colors: ["White", "Black", "Gray", "Blue"],
                sizes: ["7", "8", "9", "10", "11", "12"],
                tags: ["bestseller", "sport"]
            },
            {
                name: "Women's Cotton T-Shirt - Summer Collection",
                description: "High quality cotton t-shirt for women. Summer style, short sleeves. Available in multiple colors and sizes. Soft, breathable, and comfortable.",
                price: 4.52,
                originalPrice: 14.14,
                discountPrice: 9.62,
                rating: 3.6,
                reviewsCount: 17,
                soldCount: 98,
                stock: 500,
                category: "Fashion",
                brand: "CasualWear",
                images: ["/images/product-main.jpg"],
                colors: ["Solid White", "Black", "Grey", "Blue", "Pink"],
                sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
                tags: ["sale", "summer"]
            },
            {
                name: "Modern Travel Backpack - Professional Series",
                description: "Spacious and durable backpack perfect for travel and daily use. Multiple compartments, laptop sleeve, water-resistant material.",
                price: 49.99,
                originalPrice: 89.99,
                discountPrice: 49.99,
                rating: 4.6,
                reviewsCount: 1245,
                soldCount: 7834,
                stock: 180,
                category: "Fashion",
                brand: "TravelGear",
                images: ["/images/products/backpack.png"],
                colors: ["Black", "Gray", "Navy Blue"],
                sizes: ["20L", "30L", "40L"],
                tags: ["travel", "trending"]
            },

            // Home & Garden
            {
                name: "Ergonomic Office Chair - Executive Edition",
                description: "Premium office chair with lumbar support, adjustable height, and breathable mesh back. Perfect for long working hours.",
                price: 299.99,
                originalPrice: 499.99,
                discountPrice: 299.99,
                rating: 4.8,
                reviewsCount: 987,
                soldCount: 4567,
                stock: 75,
                category: "Home & Garden",
                brand: "ComfortZone",
                images: ["/images/products/chair.png"],
                colors: ["Black", "Gray", "White"],
                sizes: ["Standard"],
                tags: ["office", "bestseller"]
            },
            {
                name: "Modern Desk Lamp - LED Smart Light",
                description: "Adjustable LED desk lamp with touch control, multiple brightness levels, and USB charging port. Energy-efficient and eye-friendly.",
                price: 34.99,
                originalPrice: 59.99,
                discountPrice: 34.99,
                rating: 4.5,
                reviewsCount: 654,
                soldCount: 3421,
                stock: 200,
                category: "Home & Garden",
                brand: "LightPro",
                images: ["/images/product-main.jpg"],
                colors: ["White", "Black", "Silver"],
                sizes: ["Standard"],
                tags: ["smart", "sale"]
            },

            // Additional products using existing images
            {
                name: "Bluetooth Speaker - Portable Waterproof",
                description: "Powerful portable speaker with 360° sound, 12-hour battery, and IPX7 waterproof rating. Perfect for outdoor adventures.",
                price: 59.99,
                originalPrice: 99.99,
                discountPrice: 59.99,
                rating: 4.6,
                reviewsCount: 1876,
                soldCount: 9234,
                stock: 150,
                category: "Electronics",
                brand: "SoundWave",
                images: ["/images/products/headphones.png"],
                colors: ["Black", "Blue", "Red"],
                sizes: ["Standard"],
                tags: ["outdoor", "waterproof"]
            },
            {
                name: "Wireless Charging Pad - Fast Charge",
                description: "Qi-certified wireless charger with fast charging support. Compatible with all Qi-enabled devices. Sleek and compact design.",
                price: 24.99,
                originalPrice: 39.99,
                discountPrice: 24.99,
                rating: 4.4,
                reviewsCount: 543,
                soldCount: 2876,
                stock: 300,
                category: "Electronics",
                brand: "ChargeTech",
                images: ["/images/products/phone.png"],
                colors: ["Black", "White"],
                sizes: ["5W", "10W", "15W"],
                tags: ["new", "wireless"]
            },
            {
                name: "Casual Denim Jeans - Classic Fit",
                description: "Comfortable denim jeans with classic fit. Durable fabric, multiple pockets, and timeless style. Perfect for everyday wear.",
                price: 45.99,
                originalPrice: 79.99,
                discountPrice: 45.99,
                rating: 4.3,
                reviewsCount: 765,
                soldCount: 4321,
                stock: 400,
                category: "Fashion",
                brand: "DenimCo",
                images: ["/images/products/sneakers.png"],
                colors: ["Blue", "Black", "Gray"],
                sizes: ["28", "30", "32", "34", "36", "38"],
                tags: ["classic", "sale"]
            },
            {
                name: "Leather Wallet - Minimalist Design",
                description: "Slim leather wallet with RFID protection. Multiple card slots and cash compartment. Premium quality leather.",
                price: 29.99,
                originalPrice: 49.99,
                discountPrice: 29.99,
                rating: 4.7,
                reviewsCount: 432,
                soldCount: 2145,
                stock: 250,
                category: "Fashion",
                brand: "LeatherCraft",
                images: ["/images/products/backpack.png"],
                colors: ["Brown", "Black", "Tan"],
                sizes: ["Standard"],
                tags: ["minimalist", "rfid"]
            },
            {
                name: "Yoga Mat - Premium Non-Slip",
                description: "Extra thick yoga mat with superior grip and cushioning. Eco-friendly material, easy to clean, includes carrying strap.",
                price: 34.99,
                originalPrice: 59.99,
                discountPrice: 34.99,
                rating: 4.8,
                reviewsCount: 1234,
                soldCount: 6789,
                stock: 200,
                category: "Sports",
                brand: "YogaPro",
                images: ["/images/products/chair.png"],
                colors: ["Purple", "Blue", "Pink", "Black"],
                sizes: ["Standard", "Extra Long"],
                tags: ["fitness", "eco-friendly"]
            }
        ];

        for (const product of products) {
            await prisma.product.create({ data: product });
        }

        console.log(`Database seeded with ${products.length} products!`);
    }
}


// Routes
app.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
});

// Search products
app.get('/search', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sort } = req.query;
        let where = {};

        if (q) {
            where.OR = [
                { name: { contains: q } },
                { description: { contains: q } },
                { brand: { contains: q } }
            ];
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        let orderBy = { soldCount: 'desc' }; // default
        if (sort === 'price-asc') orderBy = { price: 'asc' };
        if (sort === 'price-desc') orderBy = { price: 'desc' };
        if (sort === 'rating') orderBy = { rating: 'desc' };

        const products = await prisma.product.findMany({
            where,
            orderBy
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error searching products' });
    }
});

// Get products by category
app.get('/category/:category', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { category: req.params.category }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching category products' });
    }
});

// Get featured/trending products
app.get('/featured', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            take: 12,
            orderBy: { soldCount: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching featured products' });
    }
});

app.post('/products', async (req, res) => {
    const { name, description, price, originalPrice, discountPrice, category, brand, stock, images, colors, sizes, tags } = req.body;
    try {
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                discountPrice: discountPrice ? parseFloat(discountPrice) : null,
                category: category || 'Other',
                brand: brand || '',
                stock: stock ? parseInt(stock) : 100,
                images: images || [],
                colors: colors || [],
                sizes: sizes || [],
                tags: tags || []
            },
        });

        // Send event to Kafka (optional - don't fail if Kafka is unavailable)
        try {
            await producer.send({
                topic: 'product-created',
                messages: [
                    { value: JSON.stringify(product) },
                ],
            });
        } catch (kafkaError) {
            console.warn('Failed to send Kafka event (non-critical):', kafkaError.message);
        }

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating product' });
    }
});

app.listen(port, async () => {
    await seed();
    console.log(`Product Service listening on port ${port}`);
});
