import { prisma } from './db/prisma-client.js';
import { S3Client } from '@aws-sdk/client-s3';

// Scheduler
import { NotificationScheduler } from './schedulers/notification.scheduler.js';

// Domain (Repositories)
import { UserRepository } from './domain/repositories/user.repository.js';
import { VideoRepository } from './domain/repositories/video.repository.js';
import { TokenRepository } from './domain/repositories/token.repository.js';

// Services
import { AuthService } from './services/auth/auth.service.js';
import { TokenService } from './services/auth/token.service.js';
import { UserService } from './services/user/user.service.js';
import { S3Service } from "./services/s3/s3.service.js";
import { UploadMultiPartsService } from './services/upload/upload.multi-parts.service.js';
import { UploadThumbnailsService } from './services/upload/upload.thumbnails.service.js';
import { VideoService } from './services/video/video.service.js';
import { RabbitMQProducerService } from './services/rabbitmq/rabbitmq.producer.service.js';
import { RabbitMQConsumerService } from "./services/rabbitmq/rabbitmq.consumer.service.js";
import { FcmService } from "./services/fcm/fcm.service.js";

// Business
import { AuthBusiness } from './business/auth.business.js';
import { UploadMultiPartsBusiness } from './business/upload.multi-parts.business.js';
import { UploadThumbnailsBusiness } from './business/upload.thumbnails.business.js';
import { VideoBusiness } from './business/video.business.js';
import { FcmBusiness } from './business/fcm.business.js'

// Controllers
import { AuthController } from './controllers/auth.controller.js';
import { UploadMultiPartsController } from './controllers/upload.multi-parts.controller.js';
import { UploadThumbnailsController } from './controllers/upload.thumbnails.controller.js';
import { VideoController } from './controllers/video.controller.js'
import { FcmController } from "./controllers/fcm.controller.js";

// 환경변수 설정
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const s3BucketName = process.env.S3_BUCKET_NAME;

// 의존성 조립 (Bottom-Up)

// Repositories
const userRepository = new UserRepository(prisma);
const videoRepository = new VideoRepository(prisma);
const tokenRepository = new TokenRepository(prisma);

// Services
const authService = new AuthService();
export const s3Service = new S3Service(s3Client, s3BucketName);
export const tokenService = new TokenService();
export const userService = new UserService(userRepository);
export const rabbitMQProducerService = new RabbitMQProducerService();
export const rabbitMQConsumerService = new RabbitMQConsumerService();
export const uploadMultiPartsService = new UploadMultiPartsService(s3Service, videoRepository, rabbitMQProducerService)
export const uploadThumbnailsService = new UploadThumbnailsService(s3Service, videoRepository)
const videoService = new VideoService(videoRepository);
const fcmService = new FcmService(tokenRepository);

// Scheduler
export const notificationScheduler = new NotificationScheduler(videoRepository, tokenRepository, fcmService);

// Business
const authBusiness = new AuthBusiness(authService, userService, tokenService, fcmService);
const uploadMultiPartsBusiness = new UploadMultiPartsBusiness(uploadMultiPartsService);
const uploadThumbnailsBusiness = new UploadThumbnailsBusiness(uploadThumbnailsService);
export const videoBusiness = new VideoBusiness(videoService);
const fcmBusiness = new FcmBusiness(fcmService);

// Controllers
export const authController = new AuthController(authBusiness);
export const uploadMultiPartsController = new UploadMultiPartsController(uploadMultiPartsBusiness);
export const uploadThumbnailsController = new UploadThumbnailsController(uploadThumbnailsBusiness);
export const videoController = new VideoController(videoBusiness);
export const fcmController = new FcmController(fcmBusiness);