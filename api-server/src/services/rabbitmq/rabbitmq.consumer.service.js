import amqp from 'amqplib';

export class RabbitMQConsumerService {
    constructor() {
        this.connection = null;
        this.channel = null;

        this.rabbitMQUrl = process.env.RABBITMQ_URL;
        this.exchangeName = 'harufilm_exchange';
        this.exchangeType = 'direct';
        this.queueName = 'video_complete_queue';
        this.routingKey = 'video.complete';
    }

    // 연결 설정
    async connect() {
        try {
            this.connection = await amqp.connect(this.rabbitMQUrl);
            this.channel = await this.connection.createChannel();

            // Exchange & Queue 선언 및 바인딩
            await this.channel.assertExchange(this.exchangeName, this.exchangeType, { durable: true });
            const q = await this.channel.assertQueue(this.queueName, { durable: true });
            await this.channel.bindQueue(q.queue, this.exchangeName, this.routingKey);

            // Prefetch: 한 번에 하나씩만 처리
            this.channel.prefetch(1);

            console.log('RabbitMQ Consumer Connected (Service Ready)');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ', error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    /**
     * 메시지 구독 시작
     * @param {Function} onMessage - 메시지가 왔을 때 실행할 비즈니스 로직 함수 (Callback)
     */
    async consume(onMessage) {
        if (!this.channel) {
            await this.connect();
        }

        console.log(`Waiting for messages in ${this.queueName}...`);

        this.channel.consume(this.queueName, async (msg) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());

                // Business가 넘겨준 함수(onMessage) 실행
                await onMessage(content);

                // 성공 시 Ack
                this.channel.ack(msg);
            } catch (error) {
                console.error('Error processing message:', error);
                // 실패 시 Nack
                this.channel.nack(msg, false, false);
            }
        }, {
            noAck: false
        });
    }
}