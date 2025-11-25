export class VideoBusiness {
    constructor(videoService) {
        this.videoService = videoService;
    }

    async getMonthlyVideos(userId, year, month) {
        return await this.videoService.getVideosByMonth(userId, year, month);
    }

    async getTodayFeed(userId) {
        return await this.videoService.getTodayFeed(userId);
    }

    async handleEncodedVideo(msgContent) {
        return await this.videoService.handleEncodedVideo(msgContent);
    }

    async getVideoByDate(userId, date) {
        return await this.videoService.getVideoByDate(userId, date);
    }
}