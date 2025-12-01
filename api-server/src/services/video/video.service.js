export class VideoService {
    constructor(videoRepository) {
        this.videoRepository = videoRepository;
    }

    async getVideosByMonth(userId, year, month) {
        const paddedMonth = String(month).padStart(2, '0');
        const searchPrefix = `${year}-${paddedMonth}-`; // ex. "2025-11-"

        return await this.videoRepository.findByMonth(userId, searchPrefix);
    }

    // 오늘 영상 피드 조회
    async getTodayFeed(userId) {
        const todayDate = this._getTodayKST(); // ex. "2025-11-15"
        const todayVideo = await this.videoRepository.findByDate(userId, todayDate);

        let pastVideos = [];
        if (todayVideo && todayVideo.s3Url) {
            // 오늘 비디오 존재시, 과거의 랜덤 비디오 3개 추첨
            pastVideos = await this.videoRepository.findRandomPastVideos(userId, todayDate, 3);
        }

        return {
            todayVideoExists: !!(todayVideo && todayVideo.s3Url),
            pastVideos: pastVideos,
        };
    }

    // KST 기준 오늘 날짜를 "YYYY-MM-DD" 문자열로 반환
    _getTodayKST() {
        const now = new Date();
        return now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).split(' ')[0];
    }

    // S3 Key에서 uploadDate 추출 (format: "videos/{userId}/{uploadDate}/{filename}")
    extractUploadDateFromS3Key(s3Key) {
        const parts = s3Key.split('/');
        if (parts.length >= 3) {
            return parts[2]; // YYYY-MM-DD
        }
        return this._getTodayKST();
    }

    async handleEncodedVideo(msgContent) {
        const { userId, originalS3Key, encodedS3Url } = msgContent;

        console.log(`[API Server] Received completion for: ${originalS3Key}`);

        // S3 Key에서 uploadDate 추출
        const uploadDate = this.extractUploadDateFromS3Key(originalS3Key);

        try {
            // DB 업데이트
            await this.videoRepository.updateEncodingResult(
                userId,
                originalS3Key,
                {
                    encodedUrl: encodedS3Url,
                    status: 'COMPLETE'
                }
            );
            console.log(`DB Updated for User ${userId}`);

            return {
                userId,
                uploadDate,
                success: true
            };
        } catch (error) {
            console.error("DB Update Failed:", error);
            return {
                userId,
                uploadDate,
                success: false,
                error: error.message
            };
        }
    }

    async getVideoByDate(userId, date) {
        const video = await this.videoRepository.findByDateWithTimestamps(userId, date);
        if (!video) {
            return { s3Url: null, encoded: false, timestamps: [] };
        }

        return {
            s3Url: video.s3Url,
            encoded: video.status === 'COMPLETE',
            timestamps: video.timestamps || []
        };
    }
}