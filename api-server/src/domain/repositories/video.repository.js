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

    // 과거의 비디오 중 랜덤 3개 조회 (Raw SQL 사용)
    async findRandomPastVideos(userId, todayDate, limit = 3) {
        const userIdBigInt = BigInt(userId);

        try {
            // 과거 비디오의 ID 수집
            const allPastVideos = await this.prisma.video.findMany({
                where: {
                    userId: userIdBigInt,
                    uploadDate: {
                        lt: todayDate
                    },
                    status: 'COMPLETE',
                    s3Url: {
                        not: null
                    }
                },
                select: {
                    videoId: true
                }
            });

            if (allPastVideos.length === 0) {
                return [];
            }

            // ID 목록을 섞고 데이터 조회
            const shuffledIds = allPastVideos.map(v => v.videoId);
            for (let i = shuffledIds.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
            }

            const randomIds = shuffledIds.slice(0, limit);

            // 뽑힌 ID 3개에 대해 비디오 정보와 timestamps 조회
            const rows = await this.prisma.video.findMany({
                where: {
                    videoId: {
                        in: randomIds
                    }
                },
                include: {
                    timestamps: {
                        orderBy: { time: 'asc' },
                        select: { time: true, label: true }
                    }
                }
            });

            return rows.map(r => ({
                videoId: r.videoId,
                uploadDate: r.uploadDate,
                thumbnailS3Url: r.thumbnailS3Url,
                timestamps: r.timestamps
            }));
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

    // 오늘 영상을 업로드하지 않은 모든 사용자 조회
    async findUsersWithoutTodayVideo() {
        try {
            const todayDate = this._getTodayKST();

            // 모든 사용자 조회
            const allUsers = await this.prisma.user.findMany({
                select: {
                    userId: true,
                }
            });

            if (allUsers.length === 0) {
                return [];
            }

            // 오늘 영상을 가진 사용자 조회
            const usersWithTodayVideo = await this.prisma.video.findMany({
                where: {
                    uploadDate: {
                        startsWith: todayDate
                    }
                },
                select: {
                    userId: true
                },
                distinct: ['userId']
            });

            const userIdsWithVideo = new Set(usersWithTodayVideo.map(v => v.userId.toString()));

            // 오늘 영상 없는 사용자 필터링
            const usersWithoutVideo = allUsers.filter(
                user => !userIdsWithVideo.has(user.userId.toString())
            );

            return usersWithoutVideo;
        } catch (error) {
            console.error("VideoRepository findUsersWithoutTodayVideo 에러:", error);
            throw new Error("사용자 정보를 조회할 수 없습니다.");
        }
    }
}