export class FcmService {
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    async registerDeviceToken(userId, tokenValue) {
        return await this.tokenRepository.upsertToken(userId, tokenValue);
    }

    async removeDeviceToken(userId, tokenValue) {
        return await this.tokenRepository.deleteToken(userId, tokenValue);
    }
}