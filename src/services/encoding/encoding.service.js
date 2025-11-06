//FFmpeg 로직 + 인코딩 실행

import { exec } from "child_process";
import { promisify } from "util";
import { ffmpegConfig } from "./ffmpeg.config.js";
import path from 'path';
import fs from 'fs';
import https from "https";

const execAsync = promisify(exec);

export class EncodingService {
    constructor(s3Service){
        this.s3Service = s3Service;
    }

    async downloadFromS3Url(inputUrl, tempPath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(tempPath);
            https.get(inputUrl, (response) => {
                if(response.statusCode !== 200) {
                    reject(new Error(`${response.statusCode}`));
                    return;
                }
                response.pipe(file);
                file.on("finish", () => {
                    file.close(() => {
                        console.log(`download done -> ${tempPath}`);
                        resolve(tempPath);
                    });
                });
            }).on("error", (err) => {
                fs.unlinkSync(tempPath);
                reject(err);
            });
        });
    }

    async transcodeVideo(inputPath, outputDir, filename){
        if(!inputPath || !outputDir || !filename) {
            throw new Error("inputPath, outputDir, filename이 없음");
        }
        
        const outputPath = path.resolve(outputDir, filename);
        const command = `ffmpeg -i "${inputPath}" -c:v ${ffmpegConfig.videoCodec} -preset ${ffmpegConfig.preset} -crf ${ffmpegConfig.crf} -y "${outputPath}"`;

        console.log(command);

        const{ stdout, stderr } = await execAsync(command);
        console.log(stdout || stderr);

        return outputPath;
    }

    async s3Upload(filePath, s3Key){
        if(!filePath || !s3Key) {
            throw new Error("filePath나 s3Key가 없음.");
        }

        const s3Url = await this.s3Service.uploadVideo(filePath, s3Key);
        console.log(s3Url);

        return s3Url;
    }
}