import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv"

dotenv.config();

export class S3Service {
    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.S3_BUCKET_NAME;
    }

    async uploadVideo(filePath, key) {
        try {
            if(!fs.existsSync(filePath)){
                throw new Error("파일이 존재하지 않음");
            }

            const fileStream = fs.createReadStream(filePath);

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileStream,
                ContentType: "video/mp4",
            });
            await this.s3.send(command);
            
            const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            console.log(fileUrl);
           
            return fileUrl;
        }
        catch (err){
            console.log(err.message);
            throw err;
        }
    }
}