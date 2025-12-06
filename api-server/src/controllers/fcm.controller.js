import { FcmTokenError } from '../errors/CustomError.js';

export class FcmController {
    constructor(fcmBusiness) {
        this.fcmBusiness = fcmBusiness;
    }

    // [POST] /api/fcm/token
    registerToken = async (req, res, next) => {
        try {
            if (!req.body || !req.body.fcmToken) {
                throw new FcmTokenError('FCM 토큰이 필요합니다.');
            }
            const { fcmToken } = req.body;
            await this.fcmBusiness.registerToken(req.user.userId, fcmToken);
            res.status(200).end();
        } catch (error) {
            next(error);
        }
    };
}