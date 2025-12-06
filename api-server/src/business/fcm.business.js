import { FcmTokenError } from '../errors/CustomError.js';

export class FcmBusiness {
    constructor(fcmService) {
        this.fcmService = fcmService
    }

    async registerToken(userId, tokenValue) {
        if (!tokenValue) {
            throw new FcmTokenError("FCM 토큰이 필요합니다.");
        }
        await this.fcmService.registerDeviceToken(userId, tokenValue);
    }

    async removeToken(userId, tokenValue) {
        if (!tokenValue) {
            throw new FcmTokenError("FCM 토큰이 필요합니다.");
        }
        await this.fcmService.removeDeviceToken(userId, tokenValue);
    }
}