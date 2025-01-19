import { GeminiErrorResponse } from "./types";

export class GeminiAPIError extends Error {
    public status: number;
    public data: GeminiErrorResponse;

    constructor(message: string, status: number, data: GeminiErrorResponse) {
        super(message);
        this.name = 'GeminiAPIError';
        this.status = status;
        this.data = data;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GeminiAPIError);
        }
    }
} 