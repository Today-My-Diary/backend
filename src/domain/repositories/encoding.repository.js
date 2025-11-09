export class EncodingRepository {

    constructor(prismaClient) {
        this.prisma = prismaClient;
    }

    async createJob({ userId, inputKey, outputKey, status }){
        return this.prisma.encodingJob.create({
            data: {
                userId,
                inputKey,
                outputKey,
                status,
            },
        });
    }

    async updateJobStatus({ jobId, status }){
        return this.prisma.encodingJob.update({
            where: { jobId: BigInt(jobId) },
            data: {status},
        });
    }

    async findJobById({ jobId }) {
        return this.prisma.encodingJob.findUnique({
            where: { jobId: BigInt(jobId) },
        });
    }
}