import admin from '../../config/firebase.js';

export class FcmService {
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    async registerDeviceToken(userId, tokenValue) {
        return await this.tokenRepository.upsertToken(userId, tokenValue);
    }

    async removeDeviceToken(userId, tokenValue) {
        return await this.tokenRepository.deleteToken(userId, tokenValue);
    }

    // KST 기준 날짜를 "YYYY년 MM월 DD일" 형식으로 변환
    _formatDateKST(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    }

    /**
     * 사용자에게 알림 전송 (다중 기기)
     * @param {BigInt|number|string} userId - 사용자 ID
     * @param {object} notification - 알림 객체 { title, body }
     * @param {string} originalDate - 원본 날짜 (YYYY-MM-DD 형식)
     */
    async sendNotificationToUser(userId, notification, originalDate = null) {
        try {
            // 사용자의 모든 토큰 조회
            const tokens = await this.tokenRepository.findByUserId(userId);

            if (tokens.length === 0) {
                console.log(`[FCM] User ${userId}에 등록된 토큰이 없습니다.`);
                return;
            }

            const tokenValues = tokens.map(t => t.tokenValue);
            await this.sendNotificationToTokensBatch(tokenValues, notification, originalDate);
        } catch (error) {
            console.error(`[FCM] sendNotificationToUser 에러 (userId: ${userId}):`, error);
            throw error;
        }
    }

    /**
     * 토큰 배열 기반 배치 알림 전송 (최대 500개씩 batch 전송)
     * @param {string[]} tokens - FCM 토큰 배열
     * @param {object} notification - 알림 객체 { title, body }
     * @param {string} originalDate - 원본 날짜 (YYYY-MM-DD 형식, 선택)
     */
    async sendNotificationToTokensBatch(tokens, notification, originalDate = null) {
        if (!tokens || tokens.length === 0) {
            console.log('[FCM] 전송할 토큰이 없습니다.');
            return;
        }

        try {
            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body
                },
                webpush: {
                    notification: {
                        title: notification.title,
                        body: notification.body,
                        icon: 'https://haru-film-bucket.s3.ap-northeast-2.amazonaws.com/icons/logo_icon.png',
                    },
                    fcmOptions: {
                        link: originalDate
                            ? `${process.env.FRONTEND_URL}/videos/${originalDate}`
                            : process.env.FRONTEND_URL
                    }
                }
            };

            const batchSize = 500;
            const invalidTokens = [];
            let totalSuccess = 0;
            let totalFailure = 0;

            // 500개씩 배치 분할
            for (let i = 0; i < tokens.length; i += batchSize) {
                const batchTokens = tokens.slice(i, i + batchSize);

                try {
                    const response = await admin.messaging().sendEachForMulticast({
                        tokens: batchTokens,
                        ...message
                    });

                    totalSuccess += response.successCount;
                    totalFailure += response.failureCount;

                    console.log(
                        `[FCM] 배치 전송 완료 (${i + 1}-${Math.min(i + batchSize, tokens.length)}) ` +
                        `- 성공: ${response.successCount}, 실패: ${response.failureCount}`
                    );

                    // 무효한 토큰 수집
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            const error = resp.error;
                            if (error.code === 'messaging/invalid-registration-token' ||
                                error.code === 'messaging/mismatched-credential' ||
                                error.code === 'messaging/message-rate-exceeded') {
                                invalidTokens.push(batchTokens[idx]);
                            }
                        }
                    });
                } catch (error) {
                    console.error(`[FCM] 배치 전송 에러 (${i}-${i + batchSize}):`, error);
                }
            }

            // 실패한 토큰 처리 (무효한 토큰 삭제)
            for (const token of invalidTokens) {
                this.tokenRepository.deleteByTokenValue(token)
                    .catch(error => {
                        console.error(`[FCM] 토큰 삭제 실패: ${token}`, error);
                    });
            }

            console.log(
                `[FCM] 배치 알림 전체 완료 - 대상: ${tokens.length}개, ` +
                `성공: ${totalSuccess}, 실패: ${totalFailure}, 무효: ${invalidTokens.length}개`
            );
        } catch (error) {
            console.error('[FCM] sendNotificationToTokensBatch 에러:', error);
            throw error;
        }
    }

    // 영상 업로드 성공 알림
    async notifyUploadSuccess(userId, uploadDate) {
        try {
            const formattedDate = this._formatDateKST(uploadDate);
            const notification = {
                title: '📹 업로드 성공',
                body: `✅ ${formattedDate} 영상 업로드에 성공했습니다.`
            };

            await this.sendNotificationToUser(userId, notification, uploadDate);
        } catch (error) {
            console.error(`[FCM] notifyUploadSuccess 에러 (userId: ${userId}):`, error);
            throw error;
        }
    }

    // 영상 업로드 실패 알림
    async notifyUploadFailure(userId, uploadDate) {
        try {
            const formattedDate = this._formatDateKST(uploadDate);
            const notification = {
                title: '📹 업로드 실패',
                body: `❌ ${formattedDate} 영상 업로드에 실패했습니다.`
            };

            await this.sendNotificationToUser(userId, notification, uploadDate);
        } catch (error) {
            console.error(`[FCM] notifyUploadFailure 에러 (userId: ${userId}):`, error);
            throw error;
        }
    }

    // 영상 인코딩 성공 알림
    async notifyEncodingSuccess(userId, uploadDate) {
        try {
            const formattedDate = this._formatDateKST(uploadDate);
            const notification = {
                title: '✅ 인코딩 완료',
                body: `✅ ${formattedDate} 영상 인코딩에 성공했습니다.`
            };

            await this.sendNotificationToUser(userId, notification, uploadDate);
        } catch (error) {
            console.error(`[FCM] notifyEncodingSuccess 에러 (userId: ${userId}):`, error);
            throw error;
        }
    }

    // 영상 인코딩 실패 알림
    async notifyEncodingFailure(userId, uploadDate) {
        try {
            const formattedDate = this._formatDateKST(uploadDate);
            const notification = {
                title: '❌ 인코딩 실패',
                body: `❌ ${formattedDate} 영상 인코딩에 실패했습니다.`
            };

            await this.sendNotificationToUser(userId, notification, uploadDate);
        } catch (error) {
            console.error(`[FCM] notifyEncodingFailure 에러 (userId: ${userId}):`, error);
            throw error;
        }
    }
}