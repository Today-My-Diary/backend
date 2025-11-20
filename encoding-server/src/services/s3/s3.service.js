import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import https from "https";
import path from "path";

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

    async uploadVideo(filePath, key) {
        const fileStream = fs.createReadStream(filePath);
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileStream,
            ContentType: this.getContentType(filePath),
        });

       await this.s3Client.send(command);
       return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }

    getContentType(filePath){
        const ext = filePath.split(".").pop();

        switch(ext){
            case "m3u8":
                return "application/vnd.apple.mpegurl";
            case "ts":
                return "video/mp2t";
            case "mp4":
                return "video/mp4";
            default:
                return "application/octet-stream";
        }
    }

    async uploadDirectory(localDir, s3Prefix){
        const files = await this._readRecursive(localDir);

        for(const filePath of files){
            const relativePath = path.relative(localDir, filePath).replace(/\\/g, "/");
            const s3Key = `${s3Prefix}/${relativePath}`;

            console.log(`[S3 Upload] ${filePath} → s3://${this.bucket}/${s3Key}`);

            await this.uploadVideo(filePath, s3Key);
        }

        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${s3Prefix}/master.m3u8`;
    }

    async _readRecursive(dir){
        let results = [];
        const items = await fs.promises.readdir(dir, { withFileTypes: true });

        for(const item of items) {
           const fullPath = path.join(dir, item.name);
           
           if(item.isDirectory()){
                const nested = await this._readRecursive(fullPath);
                results = results.concat(nested);
           }
           else{
                results.push(fullPath);
           }
        }

        return results;
    }

    async uploadAndBuildResponse({ workspace, userId, jobId }) {
        const s3Prefix = `users/${userId}/videos/${jobId}`;
        const masterLocalPath = `${workspace}/master.m3u8`;
        
        const masterUrl = await this.uploadDirectory(workspace, s3Prefix);

        const videoKey = `${s3Prefix}/master.m3u8`;

        return {
            success: true,
            userId,
            videoKey,
            hlsUrl: masterUrl,
        };
    }


    createS3Key(userId, filename){
        return `users/${userId}/videos/${Date.now()}_${filename}`;
    }

    createInputKey(inputPath) {
        return inputPath.split(".amazonaws.com/")[1]?.split("?")[0] || "unknown";
    }
}