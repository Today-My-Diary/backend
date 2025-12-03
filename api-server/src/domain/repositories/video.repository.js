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
        const cleanDate = uploadDate.split('T')[0];

        try {
            return await this.prisma.video.upsert({
                where: {
                    userId_uploadDate: {
                        userId: userBigIntId,
                        uploadDate: cleanDate
                    }
                },
                update: {
                    ...data,
                    uploadDate: cleanDate
                },
                create: {
                    userId: userBigIntId,
                    uploadDate: cleanDate,
                    ...data
                }
            });
        } catch (error) {
            console.error("VideoRepository upsertByDate 에러:", error);
            throw new Error("데이터베이스에 비디오 정보를 저장/업데이트할 수 없습니다.");
        }
    }

    // userId, uploadDate 로 단일 비디오 조회  ( timestamp 포함 X )
    async findByDate(userId, uploadDate) {
        try {
            return await this.prisma.video.findFirst({
                where: {
                    userId: BigInt(userId),
                    uploadDate: {
                        startsWith: uploadDate
                    }
                },
                select: {
                    videoId: true,
                    s3Url: true
                },
            });
        } catch (error) {
            console.error("VideoRepository findByDate 에러:", error);
            throw new Error("데이터베이스에서 비디오 정보를 조회할 수 없습니다.");
        }
    }

    // userId, uploadDate 로 단일 비디오 조회 ( timestamp 포함 O )
    async findByDateWithTimestamps(userId, targetDate) {
        try {
            return await this.prisma.video.findFirst({
                where: {
                    userId: BigInt(userId),
                    uploadDate: {
                        startsWith: targetDate
                    }
                },
                include: {
                    timestamps: {
                        orderBy: { time: 'asc' },
                        select: {
                            time: true,
                            label: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error("VideoRepository findByDate 에러:", error);
            throw new Error("데이터베이스에서 비디오 정보를 조회할 수 없습니다.");
        }
    }

    // 월별 썸네일 목록 조회
    async findByMonth(userId, uploadDatePrefix) {
        try {
            return await this.prisma.video.findMany({
                where: {
                    userId: BigInt(userId),
                    uploadDate: {
                        startsWith: uploadDatePrefix // ex. "2025-11-"
                    },
                },
                select: {
                    videoId: true,
                    uploadDate: true,
                    thumbnailS3Url: true
                },
                orderBy: {
                    uploadDate: 'asc'
                }
            });
        } catch (error) {
            console.error("VideoRepository findByMonth 에러:", error);
            throw new Error("월별 비디오 정보를 조회할 수 없습니다.");
        }
    }

    // 과거의 비디오 중 랜덤 3개 조회 (1개 쿼리 + SQL RAND)
    async findRandomPastVideos(userId, todayDate, limit = 3) {
        const userIdBigInt = BigInt(userId);

        try {
            // ORDER BY RAND()로 DB에서 직접 랜덤 정렬
            const rows = await this.prisma.$queryRaw`
                SELECT videoId, uploadDate, thumbnailS3Url
                FROM Video
                WHERE userId = ${userIdBigInt}
                AND uploadDate < ${todayDate}
                AND status = 'COMPLETE'
                AND s3Url IS NOT NULL
                ORDER BY RAND()
                LIMIT ${limit}
            `;

            if (rows.length === 0) {
                return [];
            }

            // Timestamps 병렬 조회 (Promise.all)
            const videosWithTimestamps = await Promise.all(
                rows.map(async (video) => {
                    const timestamps = await this.prisma.timestamp.findMany({
                        where: { videoId: video.videoId },
                        orderBy: { time: 'asc' },
                        select: { time: true, label: true }
                    });

                    return {
                        videoId: video.videoId,
                        uploadDate: video.uploadDate,
                        thumbnailS3Url: video.thumbnailS3Url,
                        timestamps: timestamps
                    };
                })
            );

            return videosWithTimestamps;
        } catch (error) {
            console.error("VideoRepository findRandomPastVideos 에러:", error);
            throw new Error("랜덤 비디오 조회에 실패했습니다.");
        }
    }

    // 인코딩 완료 후 s3Url 업데이트
    async updateEncodingResult(userId, s3Key, resultData) {
        try {
            return await this.prisma.video.update({
                where: {
                    s3Key: s3Key,
                },
                data: {
                    s3Url: resultData.encodedUrl,
                    status: resultData.status,
                }
            });
        } catch (error) {
            console.error("VideoRepository updateEncodingResult 에러:", error);
            if (error.code === 'P2025') {
                throw new Error("업데이트할 비디오를 찾을 수 없습니다.");
            }
            throw new Error("비디오 인코딩 결과를 업데이트할 수 없습니다.");
        }
    }

    // KST 기준 오늘 날짜를 "YYYY-MM-DD" 문자열로 반환
    _getTodayKST() {
        const now = new Date();
        return now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).split(' ')[0];
    }

    // 오늘 영상을 업로드하지 않은 사용자 조회 (LEFT JOIN + 토큰 동시 조회)
    async findUsersWithoutTodayVideo() {
        try {
            const todayDate = this._getTodayKST();

            // LEFT JOIN으로 토큰까지 함께 조회
            const usersWithoutVideo = await this.prisma.user.findMany({
                where: {
                    videos: {
                        none: {
                            uploadDate: { startsWith: todayDate }
                        }
                    }
                },
                select: {
                    userId: true,
                    tokens: {
                        select: { tokenValue: true }
                    }
                }
            });

            return usersWithoutVideo;
        } catch (error) {
            console.error("VideoRepository findUsersWithoutTodayVideo 에러:", error);
            throw new Error("사용자 정보를 조회할 수 없습니다.");
        }
    }
}