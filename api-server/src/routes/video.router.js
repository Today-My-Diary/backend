import express from 'express';

import { videoController } from '../container.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/videos?year={year}&month={month}
router.get('/', authMiddleware, videoController.getMonthlyVideos.bind(videoController));

// GET /api/videos/today
router.get('/today', authMiddleware, videoController.getTodayFeed.bind(videoController));

// GET /api/videos/:date
router.get('/:date', authMiddleware, videoController.getVideoByDate.bind(videoController));

export default router;
