export class EncodingBusiness {
    constructor(encodingService, s3Service, apiClient) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
        this.apiClient = apiClient;
    }

    async handleEncoding ({inputUrl, filename, userId}) {
        const { workspace, jobId } = await this.encodingService.prepareWorkspace(userId);
        const paths = this.encodingService.getHlsPaths(workspace);

        try{
            await this.s3Service.downloadFromUrl(inputUrl, paths.input);

            await this.encodingService.transcodeHls(paths.input, paths);

            await this.encodingService.generateMasterPlaylist(paths);

            const uploadResult = await this.s3Service.uploadHlsAndBuildResponse({workspace, userId, jobId});

            const { videoKey, hlsUrl } = uploadResult;

            await this.apiClient.notifyEncodingComplete({userId, videoKey, hlsUrl});

            return uploadResult;
            
        } finally {
            await this.encodingService.cleanupWorkspace(workspace);
        }
    }
}