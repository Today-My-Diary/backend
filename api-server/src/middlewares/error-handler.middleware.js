import { CustomError } from '../errors/CustomError.js';

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // CustomError
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            errorCode: err.errorCode,
            message: err.message,
        });
    }

    return res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production'
            ? '서버 내부 오류가 발생했습니다.'
            : err.message,
    });
}