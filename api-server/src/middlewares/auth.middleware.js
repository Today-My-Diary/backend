import { tokenService, userService } from '../container.js';
import {
    InvalidTokenError,
    TokenExpiredError,
    UserNotFoundError
} from '../errors/CustomError.js';

export const authMiddleware = async (req, res, next) => {
    try {
        // 헤더에서 Access Token 추출
        const { authorization } = req.headers;
        if (!authorization) {
            throw new InvalidTokenError('인증 토큰이 없습니다.');
        }

        // "Bearer <token>" 형식 분리
        const [tokenType, token] = authorization.split(' ');
        if (tokenType !== 'Bearer' || !token) {
            throw new InvalidTokenError('유효하지 않은 토큰 형식입니다.');
        }

        // Access Token 검증
        const payload = tokenService.verifyAccessToken(token);

        if (!payload) {
            throw new TokenExpiredError('Access Token이 만료되었거나 유효하지 않습니다.');
        }

        const userId = payload.userId;
        const user = await userService.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError('토큰 사용자를 찾을 수 없습니다.');
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};