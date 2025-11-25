export class EncodingBusiness {
    constructor(encodingService, s3Service, rabbitMQProducerService) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
        this.rabbitMQProducerService = rabbitMQProducerService;
    }

    async handleEncoding ({userId, s3Key, s3Url}) {
        const { workspace, jobId } = await this.encodingService.prepareWorkspace(userId);
        const paths = this.encodingService.getHlsPaths(workspace, s3Key);

        try{
            console.log(`[Encoding Start] User: ${data.userId}, File: ${data.s3Key}`);

            await this.encodingService.transcodeHls(s3Url, paths);
            await this.encodingService.generateMasterPlaylist(paths);
            const uploadResult = await this.s3Service.uploadAndBuildResponse({ workspace, userId, jobId });

            const { videoKey, hlsUrl } = uploadResult;

            //     인코딩 결과
            //              -> encodedS3Url: "https://s3.../encoded_video.m3u8"
            //              -> status: 'COMPLETED'

            // 가상의 결과 데이터 (재생 파일 위치) 예시입니다. (다음 항목들이 존재해야 합니다.)
            const resultMetadata = {
                userId: data.userId,
                originalS3Key: data.s3Key,
                encodedS3Url: hlsUrl,  // 인코딩 결과
                status: 'COMPLETED' // 인코딩 결과
            };

            await this.rabbitMQProducerService.sendMessage(resultMetadata);
            console.log(`[Encoding Finished] Result sent to API Server`);

        } finally {
            await this.encodingService.cleanupWorkspace(workspace);
        }
    }
}