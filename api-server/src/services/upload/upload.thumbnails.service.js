export class UploadThumbnailsService {

    constructor(s3Service, videoRepository) {
        this.s3Service = s3Service;
        this.videoRepository = videoRepository;
    }

    getThumbnailUploadUrl = async (userId, uploadDate) => {
        return await this.s3Service.callGetPutObjectUrl(userId, uploadDate);
    };
}