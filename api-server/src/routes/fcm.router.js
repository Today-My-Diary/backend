import express from 'express';

import { fcmController } from '../container.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/fcm/token
router.post('/token', authMiddleware, fcmController.registerToken.bind(fcmController));

export default router;
