import fs from "fs";
import path from "path";

export class EncodingBusiness {
    constructor(encodingService, s3Service) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
    }

    async handleEncoding ({inputUrl, outputDir, filename, userId}) {
        const tempInputPath = path.join(outputDir, `temp_${Date.now()}_${filename}`);
        const resultPath = path.join(outputDir, filename);

        try{
            await this.s3Service.downloadFromUrl(inputUrl, tempInputPath);

            const encodingResult = await this.encodingService.transcodeVideo(tempInputPath, outputDir, filename);

            const s3Key = await this.s3Service.createS3Key(userId, filename);
            const s3Url = await this.s3Service.uploadVideo(encodingResult, s3Key);

            const inputKey = await this.s3Service.createInputKey(inputUrl);

            return {
                success: true,
                "userId": userId,
                "inputkey": inputKey,
                "s3Key": s3Key,
                "s3Url": s3Url,
            };
        }catch (error){
            console.log("business error", error.message);
            throw error;
        } finally {
            await Promise.allSettled([
                fs.promises.unlink(tempInputPath).catch(() => {}),
                fs.promises.unlink(resultPath).catch(() => {}),
            ]);
        }
    }
}