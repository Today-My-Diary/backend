export class EncodingBusiness {
    constructor(encodingService, s3Service, apiClient) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
        this.apiClient = apiClient;
    }

    async handleEncoding ({userId, s3Key, s3Url}) {
        const { workspace, jobId } = await this.encodingService.prepareWorkspace(userId);
        const paths = this.encodingService.getHlsPaths(workspace, s3Key);

        try{
            await this.encodingService.transcodeHls(s3Url, paths);

            await this.encodingService.generateMasterPlaylist(paths);

            const uploadResult = await this.s3Service.uploadAndBuildResponse({ workspace, userId, jobId });
            
            const { videoKey, hlsUrl } = uploadResult;

            console.log("[MOCK] Encoding complete:", { userId, videoKey, hlsUrl });

            return uploadResult;
            
        } finally {
            await this.encodingService.cleanupWorkspace(workspace);
        }
    }
}