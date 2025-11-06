import path from "path";
import fs from "fs";

export class EncodingBusiness {
    constructor(encodingService, s3Service) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
    }

    async handleEncoding ({inputUrl, outputDir, filename, userId}) {
        try{
            const tempInputPath = path.resolve(outputDir, `temp_${Date.now()}.mp4`);
            await this.encodingService.downloadFromS3Url(inputUrl, tempInputPath);

            const encodingResult = await this.encodingService.transcodeVideo(tempInputPath,outputDir,filename);

            const s3Key = `users/${userId}/videos/${Date.now()}_${filename}`; 
            const s3Result = await this.encodingService.s3Upload(encodingResult,s3Key);
            
            if(fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
            if(fs.existsSync(encodingResult)) fs.unlinkSync(encodingResult);

            return {
                success: true,
                localPath: encodingResult,
                s3Url: s3Result,
            };
        }catch (error){
            console.log(error.message);
            throw error;
        }
    }
}