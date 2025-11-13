import fs from "fs";
import path from "path";

export class EncodingBusiness {
    constructor(encodingService, s3Service) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
    }

    async handleEncoding ({inputUrl, filename, userId}) {
        const outputDir = await this.encodingService.prepareWorkspace(userId);
        const { tempInputPath, outputPath } = await this.encodingService.preparePaths(outputDir, filename);

        try{
            await this.s3Service.downloadFromUrl(inputUrl, tempInputPath);

            const encodingResult = await this.encodingService.transcodeVideo(tempInputPath, outputDir, filename);

            const s3Key = await this.s3Service.createS3Key(userId, filename);
            //const s3Url = await this.s3Service.uploadVideo(encodingResult, s3Key);
            //const inputKey = await this.s3Service.createInputKey(inputUrl);

            return await this.s3Service.uploadAndBuildResponse({encodingResult, inputUrl, filename, userId});
        } finally {
            await Promise.allSettled([
                fs.promises.unlink(tempInputPath).catch(() => {}),
                fs.promises.unlink(outputPath).catch(() => {}),
            ]);
        }
    }
}