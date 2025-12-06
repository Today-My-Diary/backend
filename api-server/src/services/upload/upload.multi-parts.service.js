import { UploadCompletionError } from '../../errors/CustomError.js';

export class UploadMultiPartsService {

    constructor(s3Service, videoRepository, rabbitMQProducerService) {
        this.s3Service = s3Service;
        this.videoRepository = videoRepository;
        this.rabbitMQProducerService = rabbitMQProducerService;
    }

    initiateMultiPartsUpload = async (userId, uploadDate) => {
        return await this.s3Service.callInitiateMultiPartsUpload(userId, uploadDate);
    };

    getUploadMultiPartsUrl = async (userId, uploadId, partNumber, uploadDate) => {
        return await this.s3Service.callMultiPartsUpload(userId, uploadId, partNumber, uploadDate);
    };

    completeMultiPartsUpload = async (userId, uploadId, parts, uploadDate, timestamps) => {
        const videoS3Key = this.s3Service.generateVideoS3Key(userId, uploadDate);
        const thumbnailS3Key = this.s3Service.generateThumbnailS3Key(userId, uploadDate);

        let videoS3Url = null; // S3 비디오 업로드 성공 여부 트래킹

        try {
            videoS3Url = await this.s3Service.callMultiPartsCompleteUpload(userId, uploadId, parts, uploadDate);

            // URL과 타임스탬프 정보를 DB에 저장
            const dataToUpsert = {
                s3Key: videoS3Key,
                s3Url: videoS3Url,
                timestamps: {
                    create: timestamps
                }
            };

            // (userId, uploadDate)는 where 조건으로, dataToUpsert는 저장할 데이터로 전달
            await this.videoRepository.upsertByDate(
                userId,
                uploadDate,
                dataToUpsert
            );

            console.log(`비디오 업로드 성공: ${videoS3Key}`);

            // RabbitMQ로 인코딩 작업 메시지 전송
            await this.rabbitMQProducerService.sendMessage({
                userId,
                s3Key: videoS3Key,
                s3Url: videoS3Url,
            });

        } catch (error) {
            // --- 롤백(Rollback) ---
            console.error("업로드 완료 처리 중 에러 발생. 롤백 시도.", error);

            // [비디오 롤백] S3 업로드는 성공했으나 DB 저장이 실패한 경우 (s3VideoUrl이 존재)
            if (videoS3Url) {
                try {
                    console.log(`[ROLLBACK] S3 비디오 파일(${videoS3Key}) 삭제 시도...`);
                    await this.s3Service.callDeleteObject(videoS3Key);
                    console.log(`[ROLLBACK] S3 비디오 파일 삭제 완료.`);
                } catch (deleteError) {
                    console.error(`[CRITICAL] 비디오 롤백 실패: ${videoS3Key}`, deleteError);
                }
            }

            // [썸네일 롤백] 썸네일이 존재한다면 삭제
            try {
                console.log(`[ROLLBACK] S3 썸네일 파일(${thumbnailS3Key}) 삭제 시도...`);
                // S3는 없는 키를 삭제해도 에러를 발생시키지 않음 (Idempotent)
                await this.s3Service.callDeleteObject(thumbnailS3Key);
                console.log(`[ROLLBACK] S3 썸네일 파일 삭제 완료.`);
            } catch (deleteError) {
                console.error(`[CRITICAL] 썸네일 롤백 실패: ${thumbnailS3Key}`, deleteError);
            }

            throw new UploadCompletionError("업로드 완료 처리에 실패했습니다.");
        }
    }
}