import express from 'express';
import { registerMerchant, registerClient } from '../controllers/registrationController';

const router = express.Router();

router.post('/merchant', registerMerchant);
router.post('/client', registerClient);

export default router;
