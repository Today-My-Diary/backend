import { throwError } from "../errors/throwError.js";

export class VideoController {
    constructor(videoBusiness) {
        this.videoBusiness = videoBusiness;
    }

    getMonthlyVideos = async (req, res) => {
        const { year, month } = req.query;
        if (!year || !month) {
            throwError("year와 month는 필수입니다.", 400, "INVALID_QUERY");
        }
        const videos = await this.videoBusiness.getMonthlyVideos(req.user.userId, year, month);
        res.status(200).json(videos);
    };

    getTodayFeed = async (req, res) => {
        const feedData = await this.videoBusiness.getTodayFeed(req.user.userId);
        res.status(200).json(feedData);
    };

    getVideoByDate = async (req, res) => {
        const video = await this.videoBusiness.getVideoByDate(req.user.userId, req.params.date);
        res.status(200).json(video);
    };
}
