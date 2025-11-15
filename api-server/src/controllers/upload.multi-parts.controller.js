export class UploadMultiPartsController {

    constructor(uploadBusiness) {
        this.uploadBusiness = uploadBusiness;
    }

    // POST /api/uploads/multi-parts/initiate
    async initiateMultipartUpload(req, res, next) {
        try {
            const { uploadDate } = req.body;
            const result = await this.uploadBusiness.initiateMultipartUpload(req.user.userId, uploadDate);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/multi-parts/part
    async getUploadPartUrl(req, res, next) {
        try {
            const { uploadId, partNumber, uploadDate } = req.body;
            const presignedUrl = await this.uploadBusiness.getUploadPartUrl(req.user.userId, uploadId, partNumber, uploadDate);
            res.status(200).json({ presignedUrl });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/multi-parts/complete
    async completeMultipartUpload(req, res, next) {
        try {
            const { uploadId, parts, uploadDate, timestamps } = req.body;
            const result = await this.uploadBusiness.completeMultipartUpload(req.user.userId, uploadId, parts, uploadDate, timestamps);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
