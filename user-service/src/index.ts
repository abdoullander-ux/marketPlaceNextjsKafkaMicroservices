import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, configureKeycloakClient } from './lib/keycloakAdmin';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3003;

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[User Service] ${req.method} ${req.url}`);
    next();
});

import authRoutes from './routes/authRoutes';
import registrationRoutes from './routes/registrationRoutes';
import merchantRoutes from './routes/merchantRoutes';

app.use('/auth', authRoutes);
app.use('/register', registrationRoutes);
app.use('/merchant', merchantRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running');
});

// Initialize Keycloak admin on startup
authenticateAdmin()
    .then(() => configureKeycloakClient())
    .catch(err => {
        console.error('Failed to initialize Keycloak admin:', err);
    });

app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`);
});
