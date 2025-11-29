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

            if (status === 'SUCCESS') {
                await this.fcmService.notifyEncodingSuccess(userId, uploadDate);
            } else if (status === 'FAILURE') {
                await this.fcmService.notifyEncodingFailure(userId, uploadDate);
            }
        } catch (error) {
            console.error('[VideoBusiness] handleEncodedVideo 에러:', error);
            throw error;
        }
    }

    async getVideoByDate(userId, date) {
        return await this.videoService.getVideoByDate(userId, date);
    }
}