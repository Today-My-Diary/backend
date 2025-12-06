import { DatabaseError } from '../../errors/CustomError.js';

export class UserRepository {

    constructor(prismaClient) {
        this.prisma = prismaClient;
    }

    async findByEmail(email) {
        try {
            return this.prisma.user.findUnique({
                where: { email },
            });
        } catch (error) {
            console.error("UserRepository findByEmail 에러:", error);
            throw new DatabaseError("이메일로 사용자를 조회할 수 없습니다.");
        }
    }

    async create(userData) {
        try {
            return this.prisma.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                },
            });
        } catch (error) {
            console.error("UserRepository create 에러:", error);
            throw new DatabaseError("사용자를 생성할 수 없습니다.");
        }
    }

    async findById(userId) {
        try {
            return this.prisma.user.findUnique({
                where: { userId: BigInt(userId) },
            });
        } catch (error) {
            console.error("UserRepository findById 에러:", error);
            throw new DatabaseError("사용자 ID로 조회할 수 없습니다.");
        }
    }
}