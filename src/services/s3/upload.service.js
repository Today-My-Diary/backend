import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

export class UploadService {

    constructor(s3Client, s3BucketName, videoRepository) {
        this.s3Client = s3Client;
        this.s3BucketName = s3BucketName;
        this.videoRepository = videoRepository;
    }

    // S3 key 생성 (예: "videos/123/20251107")
    _generateS3Key = (userId, uploadDate) => {
        return `videos/${userId}/${uploadDate}`;
    }

    initiateMultipartUpload = async (userId, uploadDate) => {
        const key = this._generateS3Key(userId, uploadDate);

        const command = new CreateMultipartUploadCommand({
            Bucket: this.s3BucketName,
            Key: key,
        });

        try {
            const response = await this.s3Client.send(command);
            return {
                uploadId: response.UploadId
            };
        } catch (error) {
            console.error("S3 InitiateUpload 에러:", error);
            throw new Error("업로드를 시작할 수 없습니다.");
        }
    };

    getUploadPartUrl = async (userId, uploadId, partNumber, uploadDate) => {
        const key = this._generateS3Key(userId, uploadDate);

        const command = new UploadPartCommand({
            Bucket: this.s3BucketName,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
        });

        try {
            return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        } catch (error) {
            console.error("S3 GetUploadPartUrl 에러:", error);
            throw new Error("업로드 URL을 가져올 수 없습니다.");
        }
    };

    completeMultipartUpload = async (userId, uploadId, parts, uploadDate, timestamps) => {
        const key = this._generateS3Key(userId, uploadDate);

        const command = new CompleteMultipartUploadCommand({
            Bucket: this.s3BucketName,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        });

        try {
            const s3Response = await this.s3Client.send(command);
            const s3Url = s3Response.Location;

            // DB에 비디오 정보 저장
            await this.videoRepository.create({
                data: {
                    userId: userId,
                    createdAt: new Date(uploadDate),
                    s3Key: key,
                    s3Url: s3Url,

                    // Video-Timestamp 관계(1:N)
                    timestamps: {
                        create: timestamps
                    }
                },
                include: {
                    timestamps: true,
                }
            });
        } catch (error) {
            console.error("S3 CompleteUpload 에러:", error);
            throw new Error("업로드를 완료할 수 없습니다.");
        }
    };
}