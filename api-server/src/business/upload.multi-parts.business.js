export class UploadMultiPartsBusiness {

    constructor(uploadMultiPartsService, fcmService) {
        this.uploadMultiPartsService = uploadMultiPartsService;
        this.fcmService = fcmService;
    }

    initiateMultiPartsUpload = async (userId, uploadDate) => {
        return this.uploadMultiPartsService.initiateMultiPartsUpload(userId, uploadDate);
    }

    getUploadMultiPartsUrl = async (userId, uploadId, partNumber, uploadDate) => {
        return this.uploadMultiPartsService.getUploadMultiPartsUrl(userId, uploadId, partNumber, uploadDate);
    }

    completeMultiPartsUpload = async (userId, uploadId, parts, uploadDate, timestamps) => {
        const result = await this.uploadMultiPartsService.completeMultiPartsUpload(userId, uploadId, parts, uploadDate, timestamps);
        await this.fcmService.notifyUploadSuccess(userId, uploadDate);
        return result;
    }
}
