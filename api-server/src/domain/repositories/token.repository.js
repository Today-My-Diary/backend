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
}