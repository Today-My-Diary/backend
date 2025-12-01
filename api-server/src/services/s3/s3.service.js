import {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    DeleteObjectCommand,
    PutObjectCommand,
    GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {

    constructor(s3Client, s3BucketName) {
        this.s3Client = s3Client;
        this.s3BucketName = s3BucketName;
    }

    callInitiateMultiPartsUpload = async (userId, uploadDate) => {
        const command = this._createMultiPartsInitiateCommand(userId, uploadDate);

        try {
            const response = await this.s3Client.send(command);
            return {
                uploadId: response.UploadId
            };
        } catch (error) {
            console.error("S3 InitiateUpload 에러:", error);
            throw new Error("S3 업로드를 시작할 수 없습니다.");
        }
    };

    callMultiPartsUpload = async (userId, uploadId, partNumber, uploadDate) => {
        const command = this._createMultiPartsUploadCommand(userId, uploadId, partNumber, uploadDate);

        try {
            return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        } catch (error) {
            console.error("S3 GetUploadPartUrl 에러:", error);
            throw new Error("S3 업로드 URL을 가져올 수 없습니다.");
        }
    }

    callMultiPartsCompleteUpload = async (userId, uploadId, parts, uploadDate) => {
        const command = this._createMultiPartsCompleteCommand(userId, uploadId, parts, uploadDate);

        try {
            const response = await this.s3Client.send(command);
            return response.Location;
        } catch (error) {
            console.error("S3 CompleteUpload 에러:", error);
            throw new Error("S3 업로드를 완료할 수 없습니다.");
        }
    }

    callDeleteObject = async (s3Key) => {
        const command = this._createDeleteObjectCommand(s3Key)

        try {
            await this.s3Client.send(command);
        } catch (error) {
            // 이미 원본 에러를 처리 중이므로, 여기서는 로깅만 할 수도 있음)
            console.error(`[CRITICAL] S3 롤백 실패: ${s3Key} 파일 삭제에 실패했습니다.`, error);
        }
    }

    callGetPutObjectUrl = async (userId, uploadDate) => {
        const command = this._createPutObjectCommand(userId, uploadDate)

        try {
            // 단일 파일 업로드(PUT)용 URL 생성 (10분간 유효)
            return await getSignedUrl(this.s3Client, command, { expiresIn: 600 });
        } catch (error) {
            console.error("S3 GetPutObjectUrl 에러:", error);
            throw new Error("썸네일 업로드 URL을 가져올 수 없습니다.");
        }
    }

    // 영상 업로드용 S3 key 생성 (예: "videos/123/2025-11-07.webm")
    generateVideoS3Key = (userId, uploadDate) => {
        return `videos/${userId}/${uploadDate}.webm`;
    }

    // 썸네일 전용 S3 Key 생성 (예: "thumbnails/123/2025-11-07.jpg")
    generateThumbnailS3Key = (userId, uploadDate) => {
        return `thumbnails/${userId}/${uploadDate}.jpg`;
    }

    getS3Url = async (s3Key) => {
        try {
            const region = await this.s3Client.config.region();
            return `https://${this.s3BucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        } catch (error) {
            console.error("S3 리전 정보를 가져오거나 URL을 생성하는 데 실패했습니다.", error);
            throw new Error("S3 URL을 생성할 수 없습니다.");
        }
    }

    _createMultiPartsInitiateCommand = (userId, uploadDate) => {
        const key = this.generateVideoS3Key(userId, uploadDate);

        return new CreateMultipartUploadCommand({
            Bucket: this.s3BucketName,
            Key: key,
            ContentType: 'video/webm'
        });
    };

    _createMultiPartsUploadCommand = (userId, uploadId, partNumber, uploadDate) => {
        const key = this.generateVideoS3Key(userId, uploadDate);

        return new UploadPartCommand({
            Bucket: this.s3BucketName,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber
        });
    }

    _createMultiPartsCompleteCommand = (userId, uploadId, parts, uploadDate) => {
        const key = this.generateVideoS3Key(userId, uploadDate);
        return new CompleteMultipartUploadCommand({
            Bucket: this.s3BucketName,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        });
    }

    _createDeleteObjectCommand = (s3Key) => {
        return new DeleteObjectCommand({
            Bucket: this.s3BucketName,
            Key: s3Key,
        });
    }

    _createPutObjectCommand = (userId, uploadDate) => {
        const key = this.generateThumbnailS3Key(userId, uploadDate);
        return new PutObjectCommand({
            Bucket: this.s3BucketName,
            Key: key,
            ContentType: 'image/jpeg'
        });
    };

    /**
     * S3에서 오늘의 질문 파일 로드
     * @param {number} day - 날짜 (1-31)
     * @returns {Promise<string[]>} 질문 배열
     */
    async loadDailyQuestions(day) {
        try {
            const paddedDay = String(day).padStart(2, '0');
            const key = `questions/day${paddedDay}.json`;

            const command = new GetObjectCommand({
                Bucket: this.s3BucketName,
                Key: key
            });

            const response = await this.s3Client.send(command);
            const bodyString = await response.Body.transformToString();
            const data = JSON.parse(bodyString);

            return data.questions || [];
        } catch (error) {
            console.error(`[S3Service] 질문 파일 로드 실패 (day: ${day}):`, error);
            return null;
        }
    }
}