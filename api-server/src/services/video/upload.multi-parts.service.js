export class UploadMultiPartsService {

    constructor(s3Service, videoRepository) {
        this.s3Service = s3Service;
        this.videoRepository = videoRepository;
    }

    initiateMultiPartsUpload = async (userId, uploadDate) => {
        return await this.s3Service.callInitiateMultiPartsUpload(userId, uploadDate);
    };

    getUploadMultiPartsUrl = async (userId, uploadId, partNumber, uploadDate) => {
        return await this.s3Service.callMultiPartsUpload(userId, uploadId, partNumber, uploadDate);
    };

    completeMultiPartsUpload = async (userId, uploadId, parts, uploadDate, timestamps) => {
        let s3Url = null;
        let s3Key = null;

        try {
            s3Url = await this.s3Service.callMultiPartsCompleteUpload(userId, uploadId, parts, uploadDate);
            s3Key = this.s3Service.generateS3Key(userId, uploadDate);

            // URL과 타임스탬프 정보를 DB에 저장
            await this.videoRepository.create({
                data: {
                    userId: userId,
                    createdAt: new Date(uploadDate),
                    s3Key: s3Key,
                    s3Url: s3Url,
                    timestamps: {
                        create: timestamps
                    }
                },
                include: {
                    timestamps: true,
                }
            });
        } catch (error) {
            console.error("업로드 완료 처리 중 에러 발생. 롤백 시도.", error);

            // S3 업로드 성공 (s3Url 존재) 이후에 에러가 발생시 롤백 (S3 파일 삭제)
            if (s3Url && s3Key) {
                console.log(`[ROLLBACK] DB 저장 실패로 S3 파일(${s3Key}) 삭제를 시도합니다.`);
                await this.s3Service.callDeleteObject(s3Key);
                console.log(`[ROLLBACK] S3 롤백 성공: ${s3Key} 파일이 삭제되었습니다.`);
            } else {
                console.log("[ROLLBACK] S3 업로드 전 발생한 에러. 롤백할 S3 파일이 없습니다.");
            }
            throw new Error("업로드 완료 처리에 실패했습니다.");
        }
    }
}