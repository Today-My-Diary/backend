import schedule from 'node-schedule';

export class NotificationScheduler {
    constructor(videoRepository, tokenRepository, fcmService, s3Service) {
        this.videoRepository = videoRepository;
        this.tokenRepository = tokenRepository;
        this.fcmService = fcmService;
        this.s3Service = s3Service;
        this.scheduledJob = null;
    }

    init() {
        try {
            // 매일 20시 (KST)에 실행
            this.scheduledJob = schedule.scheduleJob('0 20 * * *', async () => {
                console.log('[Scheduler] 일일 리마인드 알림 작업 시작...');
                try {
                    await this.sendDailyRemind();
                } catch (error) {
                    console.error('[Scheduler] sendDailyRemind 실행 중 에러:', error);
                }
            });

            console.log('[Scheduler] NotificationScheduler 초기화 완료 - 매일 20:00에 알림 전송');
        } catch (error) {
            console.error('[Scheduler] NotificationScheduler init 에러:', error);
        }
    }

    // 오늘 날짜 기준으로 몇 번째 날인지 반환 (1-31)
    _getTodayDayOfMonth() {
        const now = new Date();
        return now.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).split(' ')[0].split('-')[2];
    }

    // 오늘 영상을 업로드하지 않은 사용자에게 리마인드 알림 전송
    async sendDailyRemind() {
        try {
            console.log('[Scheduler] sendDailyRemind 시작');

            // 오늘의 날짜(1-31)를 가져와서 질문 파일 로드
            const dayOfMonth = this._getTodayDayOfMonth();
            const questions = await this.s3Service.loadDailyQuestions(dayOfMonth);

            if (questions !== null) {
                console.log(`[Scheduler] 오늘의 질문 로드 완료 (day: ${dayOfMonth}):`, questions);
            }

            // 오늘 영상을 업로드하지 않은 사용자 조회
            const usersWithoutTodayVideo = await this.videoRepository.findUsersWithoutTodayVideo();

            if (usersWithoutTodayVideo.length === 0) {
                console.log('[Scheduler] 오늘 영상을 업로드하지 않은 사용자가 없습니다.');
                return;
            }

            console.log(`[Scheduler] 오늘 영상을 업로드하지 않은 사용자 수: ${usersWithoutTodayVideo.length}`);

            for (const user of usersWithoutTodayVideo) {
                try {
                    // 토큰이 있는지 확인
                    const tokens = await this.tokenRepository.findByUserId(user.userId);

                    if (tokens.length === 0) {
                        console.log(`[Scheduler] User ${user.userId}에 등록된 토큰이 없습니다.`);
                        continue;
                    }

                    // 알림 전송
                    await this.fcmService.sendDailyReminder(user.userId, questions);
                } catch (error) {
                    console.error(`[Scheduler] User ${user.userId}에 알림 전송 실패:`, error);
                }
            }
            console.log(`[Scheduler] sendDailyRemind 완료`);
        } catch (error) {
            console.error('[Scheduler] sendDailyRemind 에러:', error);
            throw error;
        }
    }
}