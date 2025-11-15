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
}