import express from 'express';

import { asyncHandler } from "../middlewares/async-handler.js";
import { authController } from '../container.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/auth/google (로그인 시작)
router.get('/google', asyncHandler(authController.redirectToGoogleLogin));

// GET /api/auth/google/callback (로그인 콜백)
router.get('/google/callback', asyncHandler(authController.handleGoogleCallback));

// POST /api/auth/reissue (AT 재발급)
router.post('/reissue', asyncHandler(authController.reissueAccessToken));

// POST /api/auth/logout
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

export default router;