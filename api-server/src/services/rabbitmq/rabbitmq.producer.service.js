import amqp from 'amqplib';
import { MessagePublishError, MessageQueueError } from '../../errors/CustomError.js';

export class RabbitMQProducerService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.exchangeName = 'harufilm_exchange';
        this.routingKey = 'video.encoding';
        this.exchangeType = 'direct';
        this.rabbitMQUrl = process.env.RABBITMQ_URL;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.rabbitMQUrl);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
                durable: true // RabbitMQ가 재시작되어도 Exchange 설정 유지
            });

            console.log(`Connected to RabbitMQ & Exchange '${this.exchangeName}' is ready`);
        } catch (error) {
            console.error('Failed to connect to RabbitMQ', error);
            // 연결 실패 시 5초 후 재시도
            setTimeout(() => this.connect(), 5000);
        }
    }

    /**
     * @param {object} msg - 전송할 메시지 객체. { userId, s3Key, s3Url }
     */
    async sendMessage(msg) {
        if (!this.channel) {
            console.error('RabbitMQ channel is not available. Message skipped.');
            throw new MessageQueueError('RabbitMQ 채널이 사용 불가능합니다.');
        }

        try {
            // publish
            const isSent = this.channel.publish(
                this.exchangeName,
                this.routingKey,
                Buffer.from(JSON.stringify(msg)), { persistent: true }
            );

            if (isSent) {
                console.log(`Sent message to Exchange '${this.exchangeName}' with Key '${this.routingKey}':`, msg);
            } else {
                console.error('Message buffer full, failed to send immediately.');
                throw new MessagePublishError('메시지 버퍼가 가득 차서 전송에 실패했습니다.');
            }

        } catch (error) {
            console.error('Failed to publish message', error);
            throw new MessagePublishError('RabbitMQ 메시지 발행에 실패했습니다.');
        }
    }
}