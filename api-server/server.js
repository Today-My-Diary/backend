import { app } from './src/app.js';

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

// 처리되지 않은 Promise rejection 처리
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    server.close(() => {
        process.exit(1);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});