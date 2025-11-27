export class NotificationScheduler {
    constructor(videoRepository, tokenRepository, fcmService) {
        this.videoRepository = videoRepository;
        this.tokenRepository = tokenRepository;
        this.fcmService = fcmService;
    }

    init() {
        // TODO : 서버 시작 시 호출할 메서드
    }

    async sendDailyRemind() {
        // TODO : 알림 전송
    }
}