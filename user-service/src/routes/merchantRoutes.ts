import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getUserByEmail, addUserToGroup } from '../lib/keycloakAdmin';

const router = express.Router();
const prisma = new PrismaClient();

// Create or Update Merchant Profile
router.post('/', async (req, res) => {
    const { userId, email, shopName, logo, address, mvolaNumber } = req.body;
    try {
        let dbUser;
        if (userId && !isNaN(Number(userId))) {
            dbUser = await prisma.user.findUnique({ where: { id: Number(userId) } });
        } else if (email) {
            dbUser = await prisma.user.findUnique({ where: { email: email } });
        }

        if (!dbUser) {
            // Create user if not found (sync from Keycloak)
            if (email) {
                dbUser = await prisma.user.create({
                    data: {
                        email,
                        name: req.body.name || 'Unknown',
                        password: 'managed-by-keycloak',
                        role: 'MERCHANT'
                    }
                });
            } else {
                return res.status(400).json({ error: 'User not found and email not provided for creation' });
            }
        }

        const merchant = await prisma.merchantProfile.upsert({
            where: { userId: dbUser.id },
            update: {
                shopName,
                logo,
                address,
                mvolaNumber,
            },
            create: {
                userId: dbUser.id,
                shopName,
                logo,
                address,
                mvolaNumber,
                status: 'PENDING'
            }
        });
        res.json(merchant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create/update merchant profile' });
    }
});

// Get Merchant Profile
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const merchant = await prisma.merchantProfile.findUnique({
            where: { userId: Number(id) },
            include: { user: true }
        });
        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }
        res.json(merchant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch merchant profile' });
    }
});

// Admin: Update Merchant Status
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // APPROVED, REJECTED
    try {
        const merchant = await prisma.merchantProfile.update({
            where: { userId: Number(id) },
            data: { status }
        });

        // If approved, update user role to MERCHANT and sync with Keycloak
        if (status === 'APPROVED') {
            const user = await prisma.user.update({
                where: { id: Number(id) },
                data: { role: 'MERCHANT' }
            });

            // Sync with Keycloak
            try {
                const keycloakUser = await getUserByEmail(user.email);
                if (keycloakUser && keycloakUser.id) {
                    await addUserToGroup(keycloakUser.id, 'merchant');
                    console.log(`Synced user ${user.email} to merchant group in Keycloak`);
                } else {
                    console.error(`Could not find Keycloak user for email ${user.email}`);
                }
            } catch (kcError) {
                console.error('Failed to sync with Keycloak:', kcError);
                // Don't fail the request if Keycloak sync fails, but log it
            }
        }

        res.json(merchant);
    } catch (error) {
        console.error('Failed to update merchant status:', error);
        res.status(500).json({ error: 'Failed to update merchant status' });
    }
});

// List Pending Merchants (for Admin)
router.get('/admin/pending', async (req, res) => {
    try {
        const merchants = await prisma.merchantProfile.findMany({
            where: { status: 'PENDING' },
            include: { user: true }
        });
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending merchants' });
    }
});

export default router;
