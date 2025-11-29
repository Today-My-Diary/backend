export class EncodingBusiness {
    constructor(encodingService, s3Service, rabbitMQProducerService) {
        this.encodingService = encodingService;
        this.s3Service = s3Service;
        this.rabbitMQProducerService = rabbitMQProducerService;
    }

    /**
     * RabbitMQConsumer가 메시지를 받으면 호출하는 메서드
     * @param {object} msgContent - { userId, s3Key, s3Url }
     */
    async handleEncoding ({ userId, s3Key, s3Url }) {
        console.log(`[Encoding Start] User: ${userId}, File: ${s3Key}`);
        
        let workspace;
        let jobId;

        try{
            console.log(`[WORKSPACE] creating workspace...`);
            const result = await this.encodingService.prepareWorkspace(userId);
            workspace = result.workspace;
            jobId = result.jobId;

            console.log(`[HLS] generating output paths`);
            const paths = this.encodingService.getHlsPaths(workspace);

            console.log(`[TRANSCODE] start ffmpeg`);
            await this.encodingService.transcodeHls(s3Url, paths);
            
            console.log(`[PLAYLIST] generating master playlist`);
            await this.encodingService.generateMasterPlaylist(paths);
            
            console.log(`[UPLOAD uploading to S3`);
            const uploadResult = await this.s3Service.uploadAndBuildResponse({ workspace, userId, jobId });
            const { hlsUrl } = uploadResult;

            console.log(`[SUCCESS] building success metadata`);
            const resultMetadata = this.encodingService.buildSuccessMetadata({
                userId,
                originalS3Key: s3Key,
                hlsUrl
            })

            console.log(`[MQ] sending success message`);
            await this.rabbitMQProducerService.sendMessage(resultMetadata);
            console.log(`[Encoding Finished] Result sent to API Server`);

        } catch (error) {
            console.error(`[Encoding Failed] User: ${userId}, File: ${s3Key}`, error);
            const failMetadata = this.encodingService.buildFailMetadata({
                userId,
                originalS3Key: s3Key,
            });

            console.log(`[MQ] sending failure message`);
            await this.rabbitMQProducerService.sendMessage(failMetadata);
        } finally {
            if(workspace){
                console.log(`[CLEANUP] removing workspace`);
                await this.encodingService.cleanupWorkspace(workspace);
            }
        }
    }
}