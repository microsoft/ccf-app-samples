export interface ErrorResponse {
    errorMessage: string;
    errorType: string;
    details?: unknown;
}

export enum StatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401
}

export class ServiceResult<T> {
    public readonly success: boolean;
    public readonly failure: boolean;
    public readonly statusCode: number;
    public readonly status: string;
    public readonly content: T | null;
    public readonly error: ErrorResponse | null;

    private constructor(content: T | null, error: ErrorResponse | null, success: boolean, statusCode: StatusCode) {
        this.content = content;
        this.error = error;
        this.success = success;
        this.failure = !success;
        this.statusCode = statusCode;
        this.status = success ? 'Success' : 'Error';
    }

    public static Succeeded<T>(content: T): ServiceResult<T> {
        return new ServiceResult<T>(content, null, true, StatusCode.OK );
    }

    public static Failed<T>(error: ErrorResponse): ServiceResult<T> {
        return new ServiceResult<T>(null, error, false, StatusCode.BAD_REQUEST);
    }

    public static Unauthorized<T>(message : string = "Unauthorized"): ServiceResult<T> {
        const error = { 
            errorMessage: message, 
            errorType: "Unauthorized"
        };

        return new ServiceResult<T>(null, error, false, StatusCode.UNAUTHORIZED);
    }
}
