import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import reportingService from "../services/reporting-service";
import { ServiceResult } from "../utils/service-result";

export function getHandler(
  request: ccfapp.Request<any>
): ccfapp.Response<CCFResponse> {
  const getCallerId = authenticationService.getCallerId(request);
  if (getCallerId.failure) return ApiResult.Failed(getCallerId);

  const callerId = getCallerId.content;

  const isValidIdentity = authenticationService.isActiveMember(callerId);
  if (isValidIdentity.failure || !isValidIdentity.content)
    return ApiResult.AuthFailure();

  const response = reportingService.getData(callerId);
  if (response.failure) return ApiResult.Failed(response);

  return ApiResult.Succeeded(response);
}

export function getByIdHandler(
  request: ccfapp.Request<any>
): ccfapp.Response<CCFResponse> {
  const getCallerId = authenticationService.getCallerId(request);
  if (getCallerId.failure) return ApiResult.Failed(getCallerId);

  const callerId = getCallerId.content;

  const isValidIdentity = authenticationService.isActiveMember(callerId);
  if (isValidIdentity.failure || !isValidIdentity.content)
    return ApiResult.AuthFailure();

  const key = request.params["id"];

  const response = reportingService.getDataById(callerId, key);
  if (response.failure) return ApiResult.Failed(response);

  return ApiResult.Succeeded(response);
}
