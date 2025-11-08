export class UploadBusiness {

    constructor(tokenService, uploadService) {
        this.tokenService = tokenService;
        this.uploadService = uploadService;
    }

    initiateMultipartUpload = async (token, uploadDate) => {
        const userId = this.tokenService.getUserId(token);
        return this.uploadService.initiateMultipartUpload(userId, uploadDate);
    }

    getUploadPartUrl = async (token, uploadId, partNumber, uploadDate) => {
        const userId = this.tokenService.getUserId(token);
        return this.uploadService.getUploadPartUrl(userId, uploadId, partNumber, uploadDate);
    };

    completeMultipartUpload = async (token, uploadId, parts, uploadDate, timestamps) => {
        const userId = this.tokenService.getUserId(token);
        return this.uploadService.completeMultipartUpload(userId, uploadId, parts, uploadDate, timestamps);
    };
}
