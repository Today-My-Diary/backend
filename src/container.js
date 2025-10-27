import { prisma } from './db/prisma-client.js';

// Domain (Repositories)
import { UserRepository } from './domain/repositories/user.repository.js';

// Services
import { AuthService } from './services/auth/auth.service.js';
import { TokenService } from './services/auth/token.service.js';
import { UserService } from './services/user/user.service.js';

// Business
import { AuthBusiness } from './business/auth.business.js';

// Controllers
import { AuthController } from './controllers/auth.controller.js';

// 의존성 조립 (Bottom-Up)

// Repositories
const userRepository = new UserRepository(prisma);

// Services
const authService = new AuthService();
export const tokenService = new TokenService();
export const userService = new UserService(userRepository);

// Business
const authBusiness = new AuthBusiness(
    authService,
    userService,
    tokenService
);

// Controllers
export const authController = new AuthController(authBusiness);