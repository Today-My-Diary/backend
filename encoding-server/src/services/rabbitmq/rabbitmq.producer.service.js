import amqp from 'amqplib';

export class RabbitMQProducerService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.exchangeName = 'harufilm_exchange';
        this.routingKey = 'video.complete';
        this.exchangeType = 'direct';
        this.rabbitMQUrl = process.env.RABBITMQ_URL;
    }

    setupEventHandlers() {
        if (this.connection) {
            this.connection.on("close", () => {
                console.error("[RabbitMQ Producer] connection closed. Reconnecting...");
                setTimeout(() => this.connect(), 3000);
            });

            this.connection.on("error", (err) => {
                console.error("[RabbitMQ Producer] connection error:", err.message);
            });
        }

        if (this.channel) {
            this.channel.on("close", () => {
                console.error("[RabbitMQ Producer] channel closed. Reconnecting...");
                setTimeout(() => this.connect(), 3000);
            });
        }
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.rabbitMQUrl);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
                durable: true
            });

            console.log(`[RabbitMQ Producer] Connected to RabbitMQ & Exchange '${this.exchangeName}' is ready`);
        } catch (error) {
            console.error('Failed to connect to RabbitMQ', error);
            // 연결 실패 시 5초 후 재시도
            setTimeout(() => this.connect(), 5000);
        }
    }

    /**
     * @param {object} msg - 전송할 메시지 객체. { userId, originalS3Key, encodedS3Url, status }
     */
    async sendMessage(msg) {
        if (!this.channel) {
            console.error('[RabbitMQ Producer] RabbitMQ channel is not available. Message skipped.');
            return;
        }

        try {
            // publish
            const isSent = this.channel.publish(
                this.exchangeName,
                this.routingKey,
                Buffer.from(JSON.stringify(msg)), { persistent: true }
            );

            if (isSent) {
                console.log(`[RabbitMQ Producer] Sent message to Exchange '${this.exchangeName}' with Key '${this.routingKey}':`, msg);
            } else {
                console.error('[RabbitMQ Producer] Message buffer full, failed to send immediately.');
            }
        } catch (error) {
            console.error('[RabbitMQ Producer] Failed to publish message', error);
        }
    }
}