import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin } from './lib/keycloakAdmin';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3003;

app.use(express.json());

import authRoutes from './routes/authRoutes';
import registrationRoutes from './routes/registrationRoutes';

app.use('/auth', authRoutes);
app.use('/register', registrationRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running');
});

// Initialize Keycloak admin on startup
authenticateAdmin().catch(err => {
    console.error('Failed to initialize Keycloak admin:', err);
});

app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`);
});
