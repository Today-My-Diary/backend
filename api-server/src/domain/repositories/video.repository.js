export class VideoRepository {

    constructor(prismaClient) {
        this.prisma = prismaClient;
    }

    async create(options) {
        try {
            return await this.prisma.video.create(options);
        } catch (error) {
            console.error("VideoRepository create 에러:", error);
            throw new Error("데이터베이스에 비디오 정보를 저장할 수 없습니다.");
        }
    }
}