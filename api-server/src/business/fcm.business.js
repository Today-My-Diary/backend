export class FcmBusiness {
    constructor(fcmService) {
        this.fcmService = fcmService
    }

    async registerToken(userId, tokenValue) {
        if (!tokenValue) {
            throw new Error("Token value is required");
        }
        await this.fcmService.registerDeviceToken(userId, tokenValue);
    }

    async removeToken(userId, tokenValue) {
        if (!tokenValue) {
            throw new Error("Token value is required");
        }
        await this.fcmService.removeDeviceToken(userId, tokenValue);
    }
}