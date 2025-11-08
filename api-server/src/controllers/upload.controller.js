export class UploadController {

    constructor(uploadBusiness) {
        this.uploadBusiness = uploadBusiness;
    }

    // POST /api/uploads/initiate
    async initiateMultipartUpload(req, res, next) {
        try {
            const { uploadDate } = req.body;
            const result = await this.uploadBusiness.initiateMultipartUpload(req.headers.authorization, uploadDate);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/part
    async getUploadPartUrl(req, res, next) {
        try {
            const { uploadId, partNumber, uploadDate } = req.body;
            const presignedUrl = await this.uploadBusiness.getUploadPartUrl(req.headers.authorization, uploadId, partNumber, uploadDate);
            res.status(200).json({ presignedUrl });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/uploads/complete
    async completeMultipartUpload(req, res, next) {
        try {
            const { uploadId, parts, uploadDate, timestamps } = req.body;
            const result = await this.uploadBusiness.completeMultipartUpload(req.headers.authorization, uploadId, parts, uploadDate, timestamps);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
