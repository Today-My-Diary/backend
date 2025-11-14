import express from 'express';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { encodingController } from '../container.js';


const router = express.Router();

// POST /api/encoding(PresignedURL, filename, userId to encoding server)
router.post('/', authMiddleware, encodingController.handleEncodingVideo.bind(encodingController));

export default router;