import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import reportingService from "../services/reporting-service";

export function getHandler(
  request: ccfapp.Request<any>
): ccfapp.Response<CCFResponse> {
  const getCallerId = authenticationService.getCallerId(request);
  if (getCallerId.failure) return ApiResult.Failed(getCallerId);

  const callerId = getCallerId.content;

  const isValidIdentity = authenticationService.isValidIdentity(callerId);
  if (isValidIdentity.failure || !isValidIdentity.content)
    return ApiResult.AuthFailure();

  const response = reportingService.getData(callerId);
  return ApiResult.Succeeded(response);
}
