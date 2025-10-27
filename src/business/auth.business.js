export class AuthBusiness {

    constructor(authService, userService, tokenService) {
        this.authService = authService;
        this.userService = userService;
        this.tokenService = tokenService;
    }

    getGoogleLoginUrl() {
        return this.authService.getGoogleLoginUrl();
    }

    async handleGoogleLogin(code) {
        const googleTokens = await this.authService.getGoogleTokens(code);
        const googleProfile = await this.authService.getGoogleProfile(googleTokens.access_token);

        const user = await this.userService.findOrCreateUserByGoogle(googleProfile);
        const refreshToken = this.tokenService.generateRefreshToken(user);

        return { refreshToken };
    }

    async reissueAccessToken(refreshToken) {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        if (!payload || !payload.userId) {
            throw new Error('유효하지 않거나 만료된 리프레시 토큰입니다.');
        }

        const user = await this.userService.findUserById(payload.userId);

        const accessToken = this.tokenService.generateAccessToken(user);
        return { accessToken };
    }
}