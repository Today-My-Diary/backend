export class UploadMultiPartsBusiness {

    constructor(uploadMultiPartsService) {
        this.uploadMultiPartsService = uploadMultiPartsService;
    }

    initiateMultiPartsUpload = async (userId, uploadDate) => {
        return this.uploadMultiPartsService.initiateMultiPartsUpload(userId, uploadDate);
    }

    getUploadMultiPartsUrl = async (userId, uploadId, partNumber, uploadDate) => {
        return this.uploadMultiPartsService.getUploadMultiPartsUrl(userId, uploadId, partNumber, uploadDate);
    };

    completeMultiPartsUpload = async (userId, uploadId, parts, uploadDate, timestamps) => {
        return this.uploadMultiPartsService.completeMultiPartsUpload(userId, uploadId, parts, uploadDate, timestamps);
    };
}
