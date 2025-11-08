import { prisma } from './db/prisma-client.js';
import { S3Client } from '@aws-sdk/client-s3';

// Domain (Repositories)
import { UserRepository } from './domain/repositories/user.repository.js';
import {VideoRepository } from './domain/repositories/video.repository.js'

// Services
import { AuthService } from './services/auth/auth.service.js';
import { TokenService } from './services/auth/token.service.js';
import { UserService } from './services/user/user.service.js';
import { UploadService } from './services/video/upload.service.js';

// Business
import { AuthBusiness } from './business/auth.business.js';
import { UploadBusiness } from './business/upload.business.js';

// Controllers
import { AuthController } from './controllers/auth.controller.js';
import { UploadController } from './controllers/upload.controller.js';

// 환경변수 설정
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const s3BucketName = process.env.S3_BUCKET_NAME;

// 의존성 조립 (Bottom-Up)

// Repositories
const userRepository = new UserRepository(prisma);
const videoRepository = new VideoRepository(prisma);

// Services
const authService = new AuthService();
export const tokenService = new TokenService();
export const userService = new UserService(userRepository);
const uploadService = new UploadService(s3Client, s3BucketName, videoRepository)

// Business
const authBusiness = new AuthBusiness(authService, userService, tokenService);
const uploadBusiness = new UploadBusiness(tokenService, uploadService);

// Controllers
export const authController = new AuthController(authBusiness);
export const uploadController = new UploadController(uploadBusiness);