import express from 'express';

import { uploadController } from '../container.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/uploads/initiate (업로드 시작)
router.post('/initiate', authMiddleware, uploadController.initiateMultipartUpload.bind(uploadController));

// POST /api/uploads/part (Part 업로드)
router.post('/part', authMiddleware, uploadController.getUploadPartUrl.bind(uploadController));

// POST /api/uploads/complete (업로드 완료)
router.post('/complete', authMiddleware, uploadController.completeMultipartUpload.bind(uploadController));

export default router;
