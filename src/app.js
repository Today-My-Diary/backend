import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.router.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use(errorHandler);

export { app };