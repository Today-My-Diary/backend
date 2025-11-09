import { prisma } from './db/prisma-client.js';

// Domain (Repositories)
import { UserRepository } from './domain/repositories/user.repository.js';
import { EncodingRepository } from './domain/repositories/encoding.repository.js';

// Services
import { AuthService } from './services/auth/auth.service.js';
import { TokenService } from './services/auth/token.service.js';
import { UserService } from './services/user/user.service.js';
import { EncodingService } from './services/encoding/encoding.service.js';
import { ffmpegConfig } from './services/encoding/ffmpeg.config.js';
import { S3Service } from './services/s3/s3.service.js';

// Business
import { AuthBusiness } from './business/auth.business.js';
import { EncodingBusiness } from './business/encoding.business.js';

// Controllers
import { AuthController } from './controllers/auth.controller.js';
import { EncodingController } from './controllers/encoding.controller.js';

// 의존성 조립 (Bottom-Up)

// Repositories
const userRepository = new UserRepository(prisma);
const encodingRepository = new EncodingRepository(prisma);

// Services
export const s3Service = new S3Service();
const authService = new AuthService();
export const tokenService = new TokenService();
export const userService = new UserService(userRepository);
const encodingService = new EncodingService(s3Service, ffmpegConfig);

// Business
const authBusiness = new AuthBusiness(
    authService,
    userService,
    tokenService
);

const encodingBusiness = new EncodingBusiness(
    encodingService,
    s3Service,
    encodingRepository
);

// Controllers
export const authController = new AuthController(authBusiness);
export const encodingController = new EncodingController(encodingBusiness);