import { prisma } from './db/prisma-client.js';

// Domain (Repositories)
import { EncodingRepository } from './domain/repositories/encoding.repository.js';

// Services
import { EncodingService } from './services/encoding/encoding.service.js';
import { ffmpegConfig } from './services/encoding/ffmpeg.config.js';
import { S3Service } from './services/s3/s3.service.js';

// Business
import { EncodingBusiness } from './business/encoding.business.js';

// Controllers
import { EncodingController } from './controllers/encoding.controller.js';

// 의존성 조립 (Bottom-Up)

// Repositories
const encodingRepository = new EncodingRepository(prisma);

// Services
export const s3Service = new S3Service();
const encodingService = new EncodingService(s3Service, ffmpegConfig);

// Business
const encodingBusiness = new EncodingBusiness(
    encodingService,
    s3Service,
    encodingRepository
);

// Controllers
export const encodingController = new EncodingController(encodingBusiness);