export class EncodingBusiness {
    constructor(encodingService, s3Service, apiClient, rabbitMQProducerService, rabbitMQConsumerService) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
        this.apiClient = apiClient;
        this.rabbitMQProducerService = rabbitMQProducerService;
        this.rabbitMQConsumerService = rabbitMQConsumerService;
    }

    // async handleEncoding ({uploadId, key, filename, userId}) {
    //     const { workspace, jobId } = await this.encodingService.prepareWorkspace(userId);
    //     const paths = this.encodingService.getHlsPaths(workspace, filename);
    //
    //     try{
    //         const parts = await this.apiClient.getMultipartParts(uploadId, key);
    //
    //         const concatListPath = await this.encodingService.generateConcatList(paths, parts);
    //
    //         await this.encodingService.transcodeMultipartHls(concatListPath, paths);
    //
    //         await this.encodingService.generateMasterPlaylist(paths);
    //
    //         const uploadResult = await this.s3Service.uploadAndBuildResponse({ workspace, userId, jobId });
    //
    //         const { videoKey, hlsUrl } = uploadResult;
    //
    //         console.log("[MOCK] Encoding complete:", { userId, videoKey, hlsUrl });
    //
    //         return uploadResult;
    //
    //     } finally {
    //         await this.encodingService.cleanupWorkspace(workspace);
    //     }
    // }

    /**
     * 서버 시작 시 호출 메서드
     * 메시지 도착시 handleEncoding 메서드 실행
     */
    async initConsume() {
        await this.rabbitMQConsumerService.consume(this.handleEncoding.bind(this));
    }

    /**
     * 실제 인코딩 작업을 수행
     * @param {object} data - { userId, s3Key, s3Url, uploadedAt }
     */
    async handleEncoding(data) {
        console.log(`[Encoding Start] User: ${data.userId}, File: ${data.s3Key}`);

        // --- [실제 인코딩 로직이 들어갈 자리 (예시)] ---
        //     1. S3에서 파일 다운로드
        //     2. FFmpeg로 변환 (HLS, MP4 등)
        //     3. S3에 변환된 파일 업로드
        //     ....
        //
        //     인코딩 결과
        //              -> encodedS3Url: "https://s3.../encoded_video.m3u8"
        //              -> status: 'COMPLETED'


        // 가상의 결과 데이터 (재생 파일 위치) 예시입니다. (다음 항목들이 존재해야 합니다.)
        const resultMetadata = {
            userId: data.userId,
            originalS3Key: data.s3Key,
            encodedS3Url: "https://s3.../encoded_video.m3u8",  // 인코딩 결과
            status: 'COMPLETED' // 인코딩 결과
        };

        await this.rabbitMQProducerService.sendMessage(resultMetadata);
        console.log(`[Encoding Finished] Result sent to API Server`);
    }
}