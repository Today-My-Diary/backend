import express from 'express';

import { authController } from '../container.js';

const router = express.Router();

// GET /api/auth/google (로그인 시작)
router.get('/google', authController.redirectToGoogleLogin.bind(authController));

// GET /api/auth/google/callback (로그인 콜백)
router.get('/google/callback', authController.handleGoogleCallback.bind(authController));

// POST /api/auth/reissue (AT 재발급)
router.post('/reissue', authController.reissueAccessToken.bind(authController));

// POST /api/auth/logout
router.post('/logout', authController.logout.bind(authController));

export default router;