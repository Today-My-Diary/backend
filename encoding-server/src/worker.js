import 'dotenv/config';
import { 
    rabbitMQConsumerService, 
    encodingBusiness, 
    rabbitMQProducerService 
} from './container.js';

console.log("[Encoding Server] Starting worker...");

// RabbitMQ 연결

(async () => {
    await rabbitMQProducerService.connect();
    console.log("[EncodingServer] Producer connected");

    await rabbitMQConsumerService.consume(
        encodingBusiness.handleEncoding.bind(encodingBusiness)
    );
    console.log("[EncodingServer] Consumer ready. Waiting for tasks...");
})();
