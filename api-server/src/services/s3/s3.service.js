import { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

    // S3 key 생성 (예: "videos/123/20251107")
    generateS3Key = (userId, uploadDate) => {
        return `videos/${userId}/${uploadDate}`;
    }

    _createMultiPartsInitiateCommand = (userId, uploadDate) => {
        const key = this.generateS3Key(userId, uploadDate);

        return new CreateMultipartUploadCommand({
            Bucket: this.s3BucketName,
            Key: key
        });
    };

    _createMultiPartsUploadCommand = (userId, uploadId, partNumber, uploadDate) => {
        const key = this.generateS3Key(userId, uploadDate);

        return new UploadPartCommand({
            Bucket: this.s3BucketName,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber
        });
    }

    _createMultiPartsCompleteCommand = (userId, uploadId, parts, uploadDate) => {
        const key = this.generateS3Key(userId, uploadDate);
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
}