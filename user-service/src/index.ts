import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running');
});

app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`);
});
