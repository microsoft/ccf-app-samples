import { ServiceResult } from "./service-result";

/**
 * HTTP Status Code
 */
export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
}

/**
 * Status code for CFF network conventions
 */
export interface CCFResponse {
  statusCode: number;
  body: any;
  headers?: { [key: string]: string; }
}

/**
 * Utility class for wrapping the response with CFF network conventions
 */
export class ApiResult {

  /**
   * Successful HTTP API operation
   * @param result Result of the service operation
   * @returns 
   */
  public static Succeeded<T>(result: ServiceResult<T>): CCFResponse {
    const response: CCFResponse = {
      statusCode: result.statusCode,
      body: result,
    };
    return response;
  }

  /**
   * Failed HTTP API operation
   * @param result Result of the service operation
   * @returns 
   */
  public static Failed<T>(result: ServiceResult<T>): CCFResponse {
    const response: CCFResponse = {
      statusCode: result.statusCode,
      body: result,
    };
    return response;
  }

  /**
   * mTLS Authentication failure
   */
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

  /**
   * Successful HTTP API operation
   * @param result Result of the service operation
   * @returns Html response
   */
  public static Html(result: string, statusCode: StatusCode = StatusCode.OK): CCFResponse {
    const response: CCFResponse = {
      statusCode: StatusCode.OK,
      headers: { "content-type": "text/html" },
      body: result,
    };
    return response;
  }

  /**
   * Successful HTTP API operation
   * @param result Result of the service operation
   * @returns Json response
   */
  public static Json(result: any, statusCode: StatusCode = StatusCode.OK): CCFResponse {
    const response: CCFResponse = {
      statusCode: statusCode,
      headers: { "content-type": "application/json" },
      body: result,
    };
    return response;
  }
}
