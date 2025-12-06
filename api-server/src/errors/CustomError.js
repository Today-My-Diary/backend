export class CustomError extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request
export class BadRequestError extends CustomError {
    constructor(message = '잘못된 요청입니다.', errorCode = 'BAD_REQUEST') {
        super(message, 400, errorCode);
    }
}

// 401 Unauthorized
export class UnauthorizedError extends CustomError {
    constructor(message = '인증이 필요합니다.', errorCode = 'UNAUTHORIZED') {
        super(message, 401, errorCode);
    }
}

// 403 Forbidden
export class ForbiddenError extends CustomError {
    constructor(message = '접근 권한이 없습니다.', errorCode = 'FORBIDDEN') {
        super(message, 403, errorCode);
    }
}

// 404 Not Found
export class NotFoundError extends CustomError {
    constructor(message = '요청한 리소스를 찾을 수 없습니다.', errorCode = 'NOT_FOUND') {
        super(message, 404, errorCode);
    }
}

// 409 Conflict
export class ConflictError extends CustomError {
    constructor(message = '리소스 충돌이 발생했습니다.', errorCode = 'CONFLICT') {
        super(message, 409, errorCode);
    }
}

// 500 Internal Server Error
export class InternalServerError extends CustomError {
    constructor(message = '서버 내부 오류가 발생했습니다.', errorCode = 'INTERNAL_SERVER_ERROR') {
        super(message, 500, errorCode);
    }
}

// 503 Service Unavailable
export class ServiceUnavailableError extends CustomError {
    constructor(message = '서비스를 사용할 수 없습니다.', errorCode = 'SERVICE_UNAVAILABLE') {
        super(message, 503, errorCode);
    }
}

// ==================== Domain-Specific Errors ====================

// Auth Domain Errors
export class InvalidTokenError extends UnauthorizedError {
    constructor(message = '유효하지 않은 토큰입니다.') {
        super(message, 'INVALID_TOKEN');
    }
}

export class TokenExpiredError extends UnauthorizedError {
    constructor(message = '토큰이 만료되었습니다.') {
        super(message, 'TOKEN_EXPIRED');
    }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
    constructor(message = '유효하지 않은 리프레시 토큰입니다.') {
        super(message, 'INVALID_REFRESH_TOKEN');
    }
}

export class GoogleAuthError extends InternalServerError {
    constructor(message = '구글 인증에 실패했습니다.') {
        super(message, 'GOOGLE_AUTH_FAILED');
    }
}

// User Domain Errors
export class UserNotFoundError extends NotFoundError {
    constructor(message = '사용자를 찾을 수 없습니다.') {
        super(message, 'USER_NOT_FOUND');
    }
}

export class UserAlreadyExistsError extends ConflictError {
    constructor(message = '이미 존재하는 사용자입니다.') {
        super(message, 'USER_ALREADY_EXISTS');
    }
}

// Video Domain Errors
export class VideoNotFoundError extends NotFoundError {
    constructor(message = '비디오를 찾을 수 없습니다.') {
        super(message, 'VIDEO_NOT_FOUND');
    }
}

export class VideoAlreadyExistsError extends ConflictError {
    constructor(message = '해당 날짜의 비디오가 이미 존재합니다.') {
        super(message, 'VIDEO_ALREADY_EXISTS');
    }
}

export class VideoEncodingError extends InternalServerError {
    constructor(message = '비디오 인코딩에 실패했습니다.') {
        super(message, 'VIDEO_ENCODING_FAILED');
    }
}

export class InvalidVideoFormatError extends BadRequestError {
    constructor(message = '지원하지 않는 비디오 형식입니다.') {
        super(message, 'INVALID_VIDEO_FORMAT');
    }
}

// Upload Domain Errors
export class UploadInitiationError extends InternalServerError {
    constructor(message = '업로드를 시작할 수 없습니다.') {
        super(message, 'UPLOAD_INITIATION_FAILED');
    }
}

export class UploadCompletionError extends InternalServerError {
    constructor(message = '업로드 완료 처리에 실패했습니다.') {
        super(message, 'UPLOAD_COMPLETION_FAILED');
    }
}

export class InvalidUploadPartError extends BadRequestError {
    constructor(message = '업로드 파트 정보가 올바르지 않습니다.') {
        super(message, 'INVALID_UPLOAD_PART');
    }
}

export class MissingUploadDataError extends BadRequestError {
    constructor(message = '업로드에 필요한 데이터가 누락되었습니다.') {
        super(message, 'MISSING_UPLOAD_DATA');
    }
}

// S3 Domain Errors
export class S3UploadError extends InternalServerError {
    constructor(message = 'S3 업로드에 실패했습니다.') {
        super(message, 'S3_UPLOAD_FAILED');
    }
}

export class S3DeleteError extends InternalServerError {
    constructor(message = 'S3 파일 삭제에 실패했습니다.') {
        super(message, 'S3_DELETE_FAILED');
    }
}

export class S3UrlGenerationError extends InternalServerError {
    constructor(message = 'S3 URL 생성에 실패했습니다.') {
        super(message, 'S3_URL_GENERATION_FAILED');
    }
}

// FCM Domain Errors
export class FcmTokenError extends BadRequestError {
    constructor(message = 'FCM 토큰이 올바르지 않습니다.') {
        super(message, 'INVALID_FCM_TOKEN');
    }
}

export class FcmSendError extends InternalServerError {
    constructor(message = '알림 전송에 실패했습니다.') {
        super(message, 'FCM_SEND_FAILED');
    }
}

// Database Domain Errors
export class DatabaseError extends InternalServerError {
    constructor(message = '데이터베이스 오류가 발생했습니다.') {
        super(message, 'DATABASE_ERROR');
    }
}

export class DatabaseConnectionError extends ServiceUnavailableError {
    constructor(message = '데이터베이스 연결에 실패했습니다.') {
        super(message, 'DATABASE_CONNECTION_FAILED');
    }
}

// RabbitMQ Domain Errors
export class MessageQueueError extends InternalServerError {
    constructor(message = '메시지 큐 오류가 발생했습니다.') {
        super(message, 'MESSAGE_QUEUE_ERROR');
    }
}

export class MessagePublishError extends InternalServerError {
    constructor(message = '메시지 발행에 실패했습니다.') {
        super(message, 'MESSAGE_PUBLISH_FAILED');
    }
}

