import 'dotenv/config';
import { 
    rabbitMQConsumerService, 
    encodingBusiness, 
    rabbitMQProducerService 
} from './container.js';

console.log("[Encoding Server] Starting worker...");

// RabbitMQ 연결
(async () => {
    try {
        await rabbitMQProducerService.connect();
        console.log("[EncodingServer] Producer connected");

        await rabbitMQConsumerService.consume(
            encodingBusiness.handleEncoding.bind(encodingBusiness)
        );
        console.log("[EncodingServer] Consumer ready. Waiting for tasks...");
    } catch (error) {
        console.error("Failed to start encoding worker:", error);
        process.exit(1);
    }
})();

// 처리되지 않은 예외 처리
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Worker shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

// 처리되지 않은 Promise rejection 처리
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Worker shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down worker gracefully...');
    try {
        await rabbitMQConsumerService.close();
        await rabbitMQProducerService.close();
        console.log('Worker terminated gracefully');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down worker gracefully...');
    try {
        await rabbitMQConsumerService.close();
        await rabbitMQProducerService.close();
        console.log('Worker terminated gracefully');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});