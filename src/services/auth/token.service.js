import jwt from 'jsonwebtoken';

export class TokenService {

    generateAccessToken(user) {
        const payload = { userId: user.userId.toString() };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '20m' })
    }

    generateRefreshToken(user) {
        const payload = { userId: user.userId.toString() };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
    }

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Refresh token verification error:', error);
            return null;
        }
    }

    verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Access Token 검증 실패', error);
            return null;
        }
    }
}