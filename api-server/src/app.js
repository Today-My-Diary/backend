import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { errorHandler } from './middlewares/error-handler.middleware.js';
import authRouter from './routes/auth.router.js';
import uploadMultiPartsRouter from "./routes/upload.multi-parts.router.js";
import uploadThumbnailsRouter from "./routes/upload.thumbnails.router.js";
import videoRouter from "./routes/video.router.js";
import fcmRouter from "./routes/fcm.router.js";
import { rabbitMQProducerService, rabbitMQConsumerService, videoBusiness, notificationScheduler } from './container.js';

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

notificationScheduler.init();

await rabbitMQProducerService.connect();
await rabbitMQConsumerService.consume(videoBusiness.handleEncodedVideo.bind(videoBusiness));

BigInt.prototype.toJSON = function() { return this.toString(); }
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api/auth', authRouter);
app.use('/api/uploads/multi-parts', uploadMultiPartsRouter);
app.use('/api/uploads/thumbnails', uploadThumbnailsRouter);
app.use('/api/videos', videoRouter);
app.use('/api/fcm', fcmRouter);

// 404 에러 핸들러
app.use((req, res, next) => {
    const error = new Error(`경로를 찾을 수 없습니다: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// 전역 에러 핸들러 (기존 errorHandler 사용)
app.use(errorHandler);


export { app };