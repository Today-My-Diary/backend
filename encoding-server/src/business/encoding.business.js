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
            const result = await this.encodingService.prepareWorkspace(userId);
            workspace = result.workspace;
            jobId = result.jobId;
            const paths = this.encodingService.getHlsPaths(workspace);

            await this.encodingService.transcodeHls(s3Url, paths);
            await this.encodingService.generateMasterPlaylist(paths);
            const uploadResult = await this.s3Service.uploadAndBuildResponse({ workspace, userId, jobId });

            const { hlsUrl } = uploadResult;

            // TODO: 응답 메시지 객체는 service에서 생성하도록 수정
            const resultMetadata = {
                userId: userId,
                originalS3Key: s3Key,
                encodedS3Url: hlsUrl,
                status: 'COMPLETE'
            };

            await this.rabbitMQProducerService.sendMessage(resultMetadata);
            console.log(`[Encoding Finished] Result sent to API Server`);

        } catch (error) {
            console.error(`[Encoding Failed] User: ${userId}, File: ${s3Key}`, error);
            // TODO: 인코딩 실패 시 API 서버에 'FAILED' 상태를 알려주는 로직 작성
            //       예시 : this.rabbitMQProducerService.sendMessage({ ..., status: 'FAILED' });
        } finally {
            if(workspace){
                console.log(`Cleaning up workspace: ${workspace}`);
                await this.encodingService.cleanupWorkspace(workspace);
            }
        }
    }
}