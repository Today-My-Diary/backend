export class UploadMultiPartsController {

    constructor(uploadMultiPartsBusiness) {
        this.uploadMultiPartsBusiness = uploadMultiPartsBusiness;
    }

    // POST /api/uploads/multi-parts/initiate
    async initiateMultiPartsUpload(req, res, next) {
        try {
            const { uploadDate } = req.body;
            const result = await this.uploadMultiPartsBusiness.initiateMultiPartsUpload(req.user.userId, uploadDate);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/multi-parts/part
    async getUploadMultiPartsUrl(req, res, next) {
        try {
            const { uploadId, partNumber, uploadDate } = req.body;
            const presignedUrl = await this.uploadMultiPartsBusiness.getUploadMultiPartsUrl(req.user.userId, uploadId, partNumber, uploadDate);
            res.status(200).json({ presignedUrl });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/multi-parts/complete
    async completeMultiPartsUpload(req, res, next) {
        try {
            const { uploadId, parts, uploadDate, timestamps } = req.body;
            const result = await this.uploadMultiPartsBusiness.completeMultiPartsUpload(req.user.userId, uploadId, parts, uploadDate, timestamps);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
