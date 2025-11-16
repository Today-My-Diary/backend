export class UploadThumbnailsController {

    constructor(uploadThumbnailsBusiness) {
        this.uploadThumbnailsBusiness = uploadThumbnailsBusiness;
    }

    // POST /api/uploads/thumbnails
    async getThumbnailPresignedUrl(req, res) {
        try {
            const { uploadDate } = req.body;
            const presignedUrl = await this.uploadThumbnailsBusiness.getThumbnailPresignedUrl(req.user.userId, uploadDate);
            res.status(200).json(presignedUrl);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // POST /api/uploads/thumbnails-complete
    async completeThumbnailUpload(req, res) {
        try {
            const { uploadDate } = req.body;
            await this.uploadThumbnailsBusiness.completeThumbnailUpload(req.user.userId, uploadDate);
            res.status(200).send("썸네일 업로드 완료");
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}