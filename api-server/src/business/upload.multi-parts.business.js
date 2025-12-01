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
        try {
            const result = await this.uploadMultiPartsService.completeMultiPartsUpload(userId, uploadId, parts, uploadDate, timestamps);
            this._sendUploadNotification(userId, uploadDate, true);
            return result;
        } catch (error) {
            this._sendUploadNotification(userId, uploadDate, false);
            throw error;
        }
    }

    // 비동기 알림 전송 (업로드 결과에 영향을 주지 않음)
    async _sendUploadNotification(userId, uploadDate, isSuccess) {
        try {
            if (isSuccess) {
                console.log(`[UploadMultiPartsBusiness] 업로드 성공 알림 전송 (userId: ${userId})`);
                await this.fcmService.notifyUploadSuccess(userId, uploadDate);
            } else {
                console.log(`[UploadMultiPartsBusiness] 업로드 실패 알림 전송 (userId: ${userId})`);
                await this.fcmService.notifyUploadFailure(userId, uploadDate);
            }
        } catch (fcmError) {
            console.error(`[UploadMultiPartsBusiness] 알림 전송 실패 (userId: ${userId}):`, fcmError);
            // 알림 전송 실패는 업로드 결과에 영향을 주지 않음
        }
    }
}
