import { throwError } from "../errors/throwError.js";

export class AuthController {
    constructor(authBusiness) {
        this.authBusiness = authBusiness;
    }

    redirectToGoogleLogin = (req, res) => {
        const url = this.authBusiness.getGoogleLoginUrl();
        res.redirect(url);
    };

    handleGoogleCallback = async (req, res) => {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login-failure`);
        }

        const refreshToken = await this.authBusiness.handleGoogleLogin(code.toString());

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL}/login-success`);
    };

    reissueAccessToken = async (req, res) => {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throwError("리프레시 토큰이 없습니다.", 401, "NO_REFRESH_TOKEN");
        }

        const accessToken = await this.authBusiness.reissueAccessToken(refreshToken);
        res.status(200).json({ accessToken });
    };

    logout = async (req, res) => {
        const { fcmToken } = req.body || {};
        await this.authBusiness.processLogout(req.user?.userId, fcmToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
        });

        res.status(200).json({ message: "로그아웃에 성공했습니다." });
    };
}
