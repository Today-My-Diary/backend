export class UploadThumbnailsBusiness {

    constructor(uploadThumbnailsService) {
        this.uploadThumbnailsService = uploadThumbnailsService;
    }

    getThumbnailPresignedUrl = async (userId, uploadDate) => {
        return await this.uploadThumbnailsService.getThumbnailUploadUrl(userId, uploadDate);
    }

    completeThumbnailUpload = async (userId, uploadDate) => {
        return await this.uploadThumbnailsService.completeThumbnailUpload(userId, uploadDate);
    }
}