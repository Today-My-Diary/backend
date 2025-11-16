import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { errorHandler } from './middlewares/error-handler.middleware.js';
import authRouter from './routes/auth.router.js';
import uploadMultiPartsRouter from "./routes/upload.multi-parts.router.js";
import uploadThumbnailsRouter from "./routes/upload.thumbnails.router.js";

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api/auth', authRouter);
app.use('/api/uploads/multi-parts', uploadMultiPartsRouter);
app.use('/api/uploads/thumbnails', uploadThumbnailsRouter)

app.use(errorHandler);

export { app };