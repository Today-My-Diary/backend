export class UserRepository {

    constructor(prismaClient) {
        this.prisma = prismaClient;
    }

    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(userData) {
        return this.prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
            },
        });
    }

    async findById(userId) {
        return this.prisma.user.findUnique({
            where: { userId: BigInt(userId) },
        });
    }
}