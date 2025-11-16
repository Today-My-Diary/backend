export class UploadThumbnailsService {

    constructor(s3Service, videoRepository) {
        this.s3Service = s3Service;
        this.videoRepository = videoRepository;
    }

    getThumbnailUploadUrl = async (userId, uploadDate) => {
        return await this.s3Service.callGetPutObjectUrl(userId, uploadDate);
    };

    completeThumbnailUpload = async (userId, uploadDate) => {
        const s3Key = this.s3Service.generateThumbnailS3Key(userId, uploadDate);
        const s3Url = await this.s3Service.getS3Url(s3Key);

        // DB에 저장
        const dataToUpsert = {
            thumbnailS3Key: s3Key,
            thumbnailS3Url: s3Url
        };

        await this.videoRepository.upsertByDate(userId, uploadDate, dataToUpsert);
    }
}