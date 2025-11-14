import { S3Client } from '@aws-sdk/client-s3';

// Domain (Repositories)

// Services
import { EncodingService } from './services/encoding/encoding.service.js';
import { ffmpegConfig } from './services/encoding/ffmpeg.config.js';
import { S3Service } from './services/s3/s3.service.js';

// Business
import { EncodingBusiness } from './business/encoding.business.js';

// Controllers
import { EncodingController } from './controllers/encoding.controller.js';
import { HealthController } from './controllers/health.controller.js';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
});

// 의존성 조립 (Bottom-Up)
const s3Bucket = process.env.S3_BUCKET_NAME;
const awsRegion = process.env.AWS_REGION;
// Repositories

// Services
export const s3Service = new S3Service(s3Client, s3Bucket, awsRegion);
const encodingService = new EncodingService(ffmpegConfig);

// Business
const encodingBusiness = new EncodingBusiness(encodingService, s3Service);

// Controllers
export const encodingController = new EncodingController(encodingBusiness);
export const healthController = new HealthController();