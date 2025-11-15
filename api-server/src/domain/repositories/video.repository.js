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

    async upsertByDate(userId, uploadDate, data) {
        const userBigIntId = BigInt(userId);

        try {
            return await this.prisma.video.upsert({
                where: {
                    userId_uploadDate: {
                        userId: userBigIntId,
                        uploadDate: uploadDate
                    }
                },
                update: data,
                create: {
                    userId: userBigIntId,
                    uploadDate: uploadDate,
                    ...data
                }
            });
        } catch (error) {
            console.error("VideoRepository upsertByDate 에러:", error);
            throw new Error("데이터베이스에 비디오 정보를 저장/업데이트할 수 없습니다.");
        }
    }
}