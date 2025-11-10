import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import encodingRouter from './routes/encoding.router.js';
import healthRouter from "./routes/health.router.js";
import { errorHandler } from './middlewares/error-handler.middleware.js';

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

app.use('/api/encoding', encodingRouter);
app.use('/health', healthRouter);

app.use(errorHandler);

export { app };