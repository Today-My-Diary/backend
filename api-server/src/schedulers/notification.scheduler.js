import schedule from 'node-schedule';
import { DatabaseError, FcmSendError, S3UrlGenerationError } from '../errors/CustomError.js';

export class NotificationScheduler {
    constructor(videoRepository, fcmService, s3Service) {
        this.videoRepository = videoRepository;
        this.fcmService = fcmService;
        this.s3Service = s3Service;
        this.scheduledJob = null;
    }

    init() {
        try {
            // 10분 간격으로 실행
            this.scheduledJob = schedule.scheduleJob('*/10 * * * *', async () => {
                console.log('[Scheduler] 일일 리마인드 알림 작업 시작...');
                try {
                    await this.sendDailyRemind();
                } catch (error) {
                    console.error('[Scheduler] sendDailyRemind 실행 중 에러:', error);
                    // Scheduler 에러는 로깅만 하고 계속 실행
                }
            });

            console.log('[Scheduler] NotificationScheduler 초기화 완료 - 10분 간격으로 알림 전송');
        } catch (error) {
            console.error('[Scheduler] NotificationScheduler init 에러:', error);
        }
    }

    // 오늘 날짜 기준으로 몇 번째 날인지 반환 (1-31)
    _getTodayDayOfMonth() {
        const now = new Date();
        return now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).split(' ')[0].split('-')[2];
    }

    // 배치 처리 기반 일일 리마인드 알림 전송
    async sendDailyRemind() {
        try {
            console.log('[Scheduler] sendDailyRemind 시작');

            // 오늘의 날짜(1-31)를 가져와서 질문 파일 로드
            const dayOfMonth = this._getTodayDayOfMonth();
            const questions = await this.s3Service.loadDailyQuestions(dayOfMonth);

            if (questions === null) {
                console.log('[Scheduler] 질문 파일 로드 실패');
                throw new S3UrlGenerationError('S3에서 질문 파일을 로드할 수 없습니다.');
            }
            console.log(`[Scheduler] 오늘의 질문 로드 완료 (day: ${dayOfMonth}):`, questions);

            // 오늘 영상 없는 사용자 + 토큰 조회
            const usersWithoutTodayVideo = await this.videoRepository.findUsersWithoutTodayVideo();

            if (usersWithoutTodayVideo.length === 0) {
                console.log('[Scheduler] 오늘 영상을 업로드하지 않은 사용자가 없습니다.');
                return;
            }
            console.log(`[Scheduler] 오늘 영상을 업로드하지 않은 사용자 수: ${usersWithoutTodayVideo.length}`);

            const allTokens = [];
            for (const user of usersWithoutTodayVideo) {
                for (const token of user.tokens) {
                    allTokens.push(token.tokenValue);
                }
            }

            if (allTokens.length === 0) {
                console.log('[Scheduler] 전송할 FCM 토큰이 없습니다.');
                return;
            }

            // 배치 알림 전송
            const notification = {
                title: '📹 오늘의 하루를 기록해보세요 📹',
                body: questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')
            };

            await this.fcmService.sendNotificationToTokensBatch(allTokens, notification, '/my');
            console.log(`[Scheduler] sendDailyRemind 완료`);
        } catch (error) {
            console.error('[Scheduler] sendDailyRemind 에러:', error);

            if (error instanceof DatabaseError) {
                console.error('[Scheduler] 데이터베이스 에러로 알림 전송 실패');
            } else if (error instanceof FcmSendError) {
                console.error('[Scheduler] FCM 알림 전송 실패');
            } else if (error instanceof S3UrlGenerationError) {
                console.error('[Scheduler] S3 질문 파일 로드 실패');
            }

            throw error;
        }
    }
}