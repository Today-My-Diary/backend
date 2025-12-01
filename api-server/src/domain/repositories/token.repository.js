export class TokenRepository {
    constructor(prisma) {
        this.prisma = prisma
    }

    // 토큰 등록/갱신
    async upsertToken(userId, tokenValue) {
        return await this.prisma.token.upsert({
            where: { tokenValue: tokenValue },
            update: { userId: BigInt(userId) }, // 이미 있으면 소유자 정보 갱신
            create: {
                tokenValue: tokenValue,
                userId: BigInt(userId),
            },
        });
    }

    // 토큰 삭제 (로그아웃 시)
    async deleteToken(userId, tokenValue) {
        return await this.prisma.token.deleteMany({
            where: {
                tokenValue: tokenValue,
                userId: BigInt(userId),
            },
        });
    }

    // 특정 사용자의 모든 토큰 조회
    async findByUserId(userId) {
        try {
            return await this.prisma.token.findMany({
                where: {
                    userId: BigInt(userId),
                },
                select: {
                    tokenValue: true,
                }
            });
        } catch (error) {
            console.error("TokenRepository findByUserId 에러:", error);
            throw new Error("사용자의 토큰 정보를 조회할 수 없습니다.");
        }
    }

    // 토큰으로 사용자 조회
    async findUserIdByToken(tokenValue) {
        try {
            const token = await this.prisma.token.findUnique({
                where: { tokenValue: tokenValue },
                select: { userId: true }
            });
            return token;
        } catch (error) {
            console.error("TokenRepository findUserIdByToken 에러:", error);
            throw new Error("토큰으로 사용자를 조회할 수 없습니다.");
        }
    }

    // 토큰 삭제 (토큰값으로)
    async deleteByTokenValue(tokenValue) {
        try {
            return await this.prisma.token.deleteMany({
                where: { tokenValue: tokenValue }
            });
        } catch (error) {
            console.error("TokenRepository deleteByTokenValue 에러:", error);
            throw new Error("토큰을 삭제할 수 없습니다.");
        }
    }
}