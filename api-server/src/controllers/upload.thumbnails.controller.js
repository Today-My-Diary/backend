import { MissingUploadDataError } from '../errors/CustomError.js';

export class UploadThumbnailsController {

    constructor(uploadThumbnailsBusiness) {
        this.uploadThumbnailsBusiness = uploadThumbnailsBusiness;
    }

    // POST /api/uploads/thumbnails
    async getThumbnailPresignedUrl(req, res, next) {
        try {
            const { uploadDate } = req.body;
            if (!uploadDate) {
                throw new MissingUploadDataError('uploadDate가 필요합니다.');
            }
            const presignedUrl = await this.uploadThumbnailsBusiness.getThumbnailPresignedUrl(req.user.userId, uploadDate);
            res.status(200).json({ presignedUrl });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/thumbnails-complete
    async completeThumbnailUpload(req, res, next) {
        try {
            const { uploadDate } = req.body;
            if (!uploadDate) {
                throw new MissingUploadDataError('uploadDate가 필요합니다.');
            }
            await this.uploadThumbnailsBusiness.completeThumbnailUpload(req.user.userId, uploadDate);
            const message = "썸네일 업로드 완료"
            res.status(200).json({ message });
        } catch (error) {
            next(error);
        }
    }
}