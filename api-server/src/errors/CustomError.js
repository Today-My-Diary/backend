export class CustomError extends Error {
    constructor(message, status = 400, code = "BAD_REQUEST", details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
    }

    toJSON() {
        return {
            message: this.message,
            code: this.code,
            status: this.status,
            details: this.details,
            timestamp: new Date().toISOString(),
        };
    }
}
