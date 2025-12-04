import { CustomError } from "./CustomError.js";

export const throwError = (message, status = 400, code = "BAD_REQUEST", details = null) => {
    throw new CustomError(message, status, code, details);
};
