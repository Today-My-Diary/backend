export class AuthController {
    constructor(authBusiness) {
        this.authBusiness = authBusiness;
    }

    // GET /api/auth/google
    redirectToGoogleLogin(req, res, next) {
        try {
            const url = this.authBusiness.getGoogleLoginUrl();
            res.redirect(url);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/auth/google/callback
    async handleGoogleCallback(req, res, next) {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login-failure`);
        }

        try {
            // RefreshToken을 httpOnly 쿠키에 설정
            const refreshToken = await this.authBusiness.handleGoogleLogin(code.toString());
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            });

            // AccessToken 없이, 프론트 성공 페이지로 리디렉션
            res.redirect(`${process.env.FRONTEND_URL}/login-success`);

        } catch (error) {
            console.error('[Controller] 구글 콜백 처리 실패', error);
            res.redirect(`${process.env.FRONTEND_URL}/login-failure`);
        }
    }

    // POST /api/auth/reissue
    async reissueAccessToken(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({ message: '리프레시 토큰이 없습니다.' });
            }

            const accessToken = await this.authBusiness.reissueAccessToken(refreshToken);
            res.status(200).json({ accessToken });

        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    }

    // POST /api/auth/logout
    async logout(req, res, next) {
        try {
            const { fcmToken } = req.body;
            await this.authBusiness.processLogout(req.user?.userId, fcmToken);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
            });

            res.status(200).json({ message: '로그아웃에 성공했습니다.' });

        } catch (error) {
            next(error);
        }
    }
}