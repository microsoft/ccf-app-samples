import { ServiceResult } from "./service-result";

export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
}

export interface CCFResponse {
  statusCode: number;
  body: any;
}

export class ApiResult {
  public static Succeeded<T>(result: ServiceResult<T>): CCFResponse {
    const response: CCFResponse = {
      statusCode: result.statusCode,
      body: result,
    };
    return response;
  }

  public static Failed<T>(result: ServiceResult<T>): CCFResponse {
    const response: CCFResponse = {
      statusCode: result.statusCode,
      body: result,
    };
    return response;
  }

  public static AuthFailure(): CCFResponse {
    const response: CCFResponse = {
      statusCode: StatusCode.UNAUTHORIZED,
      body: ServiceResult.Failed(
        {
          errorMessage: "Unauthorized",
          errorType: "Unauthorized",
        },
        StatusCode.UNAUTHORIZED
      ),
    };
    return response;
  }
}
