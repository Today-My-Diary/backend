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

            return await this.s3Service.uploadAndBuildResponse({encodingResult, inputUrl, filename, userId});
        } finally {
            await this.encodingService.cleanupWorkspace(outputDir);
        }
    }
}