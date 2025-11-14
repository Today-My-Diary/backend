import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import https from "https";

export class S3Service {
    constructor(s3Client, bucket, region) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.region = region;

    }

    async downloadFromUrl(inputUrl, tempPath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(tempPath);
            https.get(inputUrl, (response) => {
                    if(response.statusCode !== 200) {
                        reject(new Error(`HTTP ${response.statusCode}`));
                        return;
                    }
                    response.pipe(file);
                    file.on("finish", () => {
                        file.close(() => resolve(tempPath));
                    });
            }).on("error", (err) => {
                fs.promises.unlink(tempPath);
                console.log("downloadFromUrl error", err);
                reject(err);
            });
        });
    }

    createS3Key(userId, filename){
        return `users/${userId}/videos/${Date.now()}_${filename}`;
    }

    createInputKey(inputPath) {
        return inputPath.split(".amazonaws.com/")[1]?.split("?")[0] || "unknown";
    }

    async uploadVideo(filePath, key) {
        const fileStream = fs.createReadStream(filePath);
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileStream,
        });

       await this.s3Client.send(command);
       return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }

    async uploadAndBuildResponse({ encodingResult, inputUrl, filename, userId }) {
        const videoKey = this.createS3Key(userId, filename);
        const inputKey = this.createInputKey(inputUrl);

        await this.uploadVideo(encodingResult, videoKey);

        const s3Url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${videoKey}`;

        return {
            success: true,
            userId,
            inputKey,
            s3Key: videoKey,
            s3Url
        };  
    }
}