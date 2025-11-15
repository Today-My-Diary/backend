export class UploadBusiness {

    constructor(tokenService, uploadService) {
        this.uploadService = uploadService;
    }

    initiateMultipartUpload = async (userId, uploadDate) => {
        return this.uploadService.initiateMultipartUpload(userId, uploadDate);
    }

    getUploadPartUrl = async (userId, uploadId, partNumber, uploadDate) => {
        return this.uploadService.getUploadPartUrl(userId, uploadId, partNumber, uploadDate);
    };

    completeMultipartUpload = async (userId, uploadId, parts, uploadDate, timestamps) => {
        return this.uploadService.completeMultipartUpload(userId, uploadId, parts, uploadDate, timestamps);
    };
}
