import amqp from 'amqplib';

export class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queueName = 'video_encoding';
        this.rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.rabbitMQUrl);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ', error);
            // 연결 실패 시 5초 후 재시도
            setTimeout(() => this.connect(), 5000);
        }
    }

    /**
     * @param {object} msg - 전송할 메시지 객체. 예: { userId, s3Key, s3Url }
     */
    async sendMessage(msg) {
        if (!this.channel) {
            console.error('RabbitMQ channel is not available.');
            return;
        }
        try {
            this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(msg)), { persistent: true });
            console.log(`Sent message to ${this.queueName}:`, msg);
        } catch (error) {
            console.error('Failed to send message to queue', error);
        }
    }
}