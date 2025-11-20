import { S3Client } from '@aws-sdk/client-s3';

// Domain (Repositories)

// Services
import { EncodingService } from './services/encoding/encoding.service.js';
import { ffmpegConfig } from './services/encoding/ffmpeg.config.js';
import { S3Service } from './services/s3/s3.service.js';
import { ApiClient } from './services/api/api.client.js';

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
const apiServer = process.env.API_SERVER_URL;

// Repositories

// Services
export const s3Service = new S3Service(s3Client, s3Bucket, awsRegion);
const encodingService = new EncodingService(ffmpegConfig);
export const apiClient = new ApiClient(apiServer);

// Business
const encodingBusiness = new EncodingBusiness(encodingService, s3Service, apiClient);


// Controllers
export const encodingController = new EncodingController(encodingBusiness);
export const healthController = new HealthController();