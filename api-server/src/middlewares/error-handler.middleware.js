import { CustomError } from "../errors/CustomError.js";

export const errorHandler = (err, req, res, next) => {
    console.error("[ERROR HANDLER]", err);

    if (err instanceof CustomError) {
        return res.status(err.status).json(err.toJSON());
    }

    return res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
        status: 500,
        details: { originalMessage: err.message },
        timestamp: new Date().toISOString(),
    });
};
