import { MissingUploadDataError } from '../errors/CustomError.js';

export class VideoController {
    constructor(videoBusiness) {
        this.videoBusiness = videoBusiness;
    }

    // GET /api/videos?year={year}&month={month}
    getMonthlyVideos = async (req, res, next) => {
        try {
            const { year, month } = req.query;
            if (!year || !month) {
                throw new MissingUploadDataError('year와 month 파라미터가 필요합니다.');
            }
            const videos = await this.videoBusiness.getMonthlyVideos(req.user.userId, year, month);
            res.status(200).json(videos);
        } catch (error) {
            next(error);
        }
    };

    // GET /api/videos/today
    getTodayFeed = async (req, res, next) => {
        try {
            const feedData = await this.videoBusiness.getTodayFeed(req.user.userId);
            res.status(200).json(feedData);
        } catch (error) {
            next(error);
        }
    };

    // GET /api/videos/:date
    getVideoByDate = async (req, res, next) => {
        try {
            const video = await this.videoBusiness.getVideoByDate(req.user.userId, req.params.date);
            res.status(200).json(video);
        } catch (error) {
            next(error);
        }
    }
}