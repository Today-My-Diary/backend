import express from 'express';

import { uploadThumbnailsController } from '../container.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/uploads/thumbnails
router.post('/initiate', authMiddleware, uploadThumbnailsController.getThumbnailPresignedUrl.bind(uploadThumbnailsController));

// POST /api/uploads/thumbnails-complete
router.post('/part', authMiddleware, uploadThumbnailsController.completeThumbnailUpload.bind(uploadThumbnailsController));

export default router;
