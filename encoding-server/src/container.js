import dotenv from 'dotenv';
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

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// 의존성 조립 (Bottom-Up)

// Repositories

// Services
export const s3Service = new S3Service(s3Client);
const encodingService = new EncodingService(ffmpegConfig);

// Business
const encodingBusiness = new EncodingBusiness(encodingService, s3Service);

// Controllers
export const encodingController = new EncodingController(encodingBusiness);