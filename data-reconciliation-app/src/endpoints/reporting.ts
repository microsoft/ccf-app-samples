import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { ApiResult } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import reportingService from "../services/reporting-service";

export function getHandler(request: ccfapp.Request<any>): ccfapp.Response<any> {
  try {
    const getCallerId = authenticationService.getCallerId(request);
    if (getCallerId.failure) {
      return ApiResult.Failed(getCallerId);
    }

    const callerId = getCallerId.content;
    const isValidIdentity = authenticationService.isValidIdentity(callerId);
    if (isValidIdentity.failure || !isValidIdentity.content) {
      return ApiResult.Unauthorized();
    }

    const response = reportingService.getData(callerId);
    return ApiResult.Succeeded(response);
  } catch (ex) {
    const response = ServiceResult.Failed({
      errorMessage: ex.message,
      errorType: "DataIngestError",
      details: ex,
    });
    return ApiResult.Failed(response);
  }
}
