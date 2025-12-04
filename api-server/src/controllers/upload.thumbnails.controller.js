export class UploadThumbnailsController {
    constructor(uploadThumbnailsBusiness) {
        this.uploadThumbnailsBusiness = uploadThumbnailsBusiness;
    }

    getThumbnailPresignedUrl = async (req, res) => {
        const { uploadDate } = req.body;
        const presignedUrl = await this.uploadThumbnailsBusiness.getThumbnailPresignedUrl(
            req.user.userId,
            uploadDate
        );
        res.status(200).json({ presignedUrl });
    };

    completeThumbnailUpload = async (req, res) => {
        const { uploadDate } = req.body;
        await this.uploadThumbnailsBusiness.completeThumbnailUpload(
            req.user.userId,
            uploadDate
        );
        res.status(200).json({ message: "썸네일 업로드 완료" });
    };
}
