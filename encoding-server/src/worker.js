import 'dotenv/config';
import { rabbitMQConsumerService, encodingBusiness, rabbitMQProducerService } from './container.js';

console.log("[Encoding Server] Starting worker...");

// RabbitMQ 연결
await rabbitMQProducerService.connect();
await rabbitMQConsumerService.consume(
    encodingBusiness.handleEncoding.bind(encodingBusiness)
);

console.log("[Encoding Server] Worker initialized.");