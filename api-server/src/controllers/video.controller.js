export class VideoController {
    constructor(videoBusiness) {
        this.videoBusiness = videoBusiness;
    }

    // GET /api/videos?year={year}&month={month}
    getMonthlyVideos = async (req, res) => {
        try {
            const { year, month } = req.query;
            const videos = await this.videoBusiness.getMonthlyVideos(req.user.userId, year, month);
            res.status(200).json(videos);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // GET /api/videos/today
    getTodayFeed = async (req, res) => {
        try {
            const feedData = await this.videoBusiness.getTodayFeed(req.user.userId);
            res.status(200).json(feedData);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}