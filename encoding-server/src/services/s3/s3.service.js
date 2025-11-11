import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import https from "https";

export class S3Service {
    constructor(s3Client) {
        this.s3Client = s3Client;
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
                fs.unlinkSync(tempPath);
                console.log("downloadFromUrl error", error);
                reject(err);
            });
        });
    }

    async createS3Key(userId, filename){
        return `users/${userId}/videos/${Date.now()}_${filename}`;
    }

    async createInputKey(inputPath) {
        return inputPath.split(".amazonaws.com/")[1]?.split("?")[0] || "unknown";
    }

    async uploadVideo(filePath, key) {
        const fileStream = fs.createReadStream(filePath);
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: fileStream,
        });

       await this.s3Client.send(command);
       return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
}