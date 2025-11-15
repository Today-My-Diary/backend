import express from 'express';

import { uploadMultiPartsController } from '../container.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/uploads/initiate (업로드 시작)
router.post('/initiate', authMiddleware, uploadMultiPartsController.initiateMultipartUpload.bind(uploadMultiPartsController));

// POST /api/uploads/part (Part 업로드)
router.post('/part', authMiddleware, uploadMultiPartsController.getUploadPartUrl.bind(uploadMultiPartsController));

// POST /api/uploads/complete (업로드 완료)
router.post('/complete', authMiddleware, uploadMultiPartsController.completeMultipartUpload.bind(uploadMultiPartsController));

export default router;
