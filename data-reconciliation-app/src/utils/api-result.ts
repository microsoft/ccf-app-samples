import { ServiceResult } from "./service-result";

export interface CCFResult {
    statusCode: number;
    body: any;
}


export class ApiResult {

    public static Response<T>(result: ServiceResult<T>): CCFResult {
        const response: CCFResult = {
            statusCode: result.statusCode,
            body: result
        };
        return response;
    }
}
