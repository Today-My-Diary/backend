export class VideoBusiness {
    constructor(videoService, fcmService) {
        this.videoService = videoService;
        this.fcmService = fcmService;
    }

    async getMonthlyVideos(userId, year, month) {
        return await this.videoService.getVideosByMonth(userId, year, month);
    }

    async getTodayFeed(userId) {
        return await this.videoService.getTodayFeed(userId);
    }

    async handleEncodedVideo(msgContent) {
        const { userId, status } = msgContent;

        try {
            const result = await this.videoService.handleEncodedVideo(msgContent);
            const uploadDate = result.uploadDate;

            this._sendEncodingNotification(userId, uploadDate, status);
        } catch (error) {
            // DB 업데이트 실패는 throw (RabbitMQ nack)
            console.error('[VideoBusiness] 비디오 처리 에러:', error);
            throw error;
        }
    }

    // 비동기 알림 전송 (DB 업데이트와 독립적)
    async _sendEncodingNotification(userId, uploadDate, status) {
        try {
            if (status === 'SUCCESS') {
                console.log(`[VideoBusiness] 인코딩 성공 알림 전송 (userId: ${userId}, uploadDate: ${uploadDate})`);
                await this.fcmService.notifyEncodingSuccess(userId, uploadDate);
            } else if (status === 'FAILURE') {
                console.log(`[VideoBusiness] 인코딩 실패 알림 전송 (userId: ${userId}, uploadDate: ${uploadDate})`);
                await this.fcmService.notifyEncodingFailure(userId, uploadDate);
            }
        } catch (fcmError) {
            console.error(`[VideoBusiness] 알림 전송 실패 (userId: ${userId}):`, fcmError);
            // 알림 전송 실패는 RabbitMQ Ack에 영향을 주지 않음 (DB는 이미 업데이트됨)
        }
    }

    async getVideoByDate(userId, date) {
        return await this.videoService.getVideoByDate(userId, date);
    }
}