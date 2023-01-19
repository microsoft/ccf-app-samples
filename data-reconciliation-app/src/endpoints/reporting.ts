import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import reportingService from "../services/reporting-service";
import { DataSchema } from "../models/data-schema";

/**
 * HTTP GET Handler for generating a reconciliation report with all records
 * @param {ccfapp.Request<any>} request - mTLS request with userId
 * @returns {ServiceResult<object[]>} - Reconcilation report
 */
export function getAllHandler(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  const getCallerId = authenticationService.getCallerId(request);
  if (getCallerId.failure) return ApiResult.Failed(getCallerId);

  const callerId = getCallerId.content;

  const isValidIdentity = authenticationService.isValidIdentity(callerId);
  if (isValidIdentity.failure || !isValidIdentity.content)
    return ApiResult.AuthFailure();

  const response = reportingService.getData(callerId);
  if (response.failure) return ApiResult.Failed(response);

  // map summary data-model to result model
  const mappedRecords = DataSchema.mapSummaryRecords(response.content);

  return ApiResult.Succeeded(mappedRecords);
}

/**
 * HTTP GET Handler for generating a reconciliation report for a recordId
 * @param {ccfapp.Request<any>} request - mTLS request with userId and recordId
 * @returns {ServiceResult<object[]>} - Reconcilation report
 */
export function getByIdHandler(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  const getCallerId = authenticationService.getCallerId(request);
  if (getCallerId.failure) return ApiResult.Failed(getCallerId);

  const callerId = getCallerId.content;

  const isValidIdentity = authenticationService.isValidIdentity(callerId);
  if (isValidIdentity.failure || !isValidIdentity.content)
    return ApiResult.AuthFailure();

  const key = request.params["id"];

  const response = reportingService.getDataById(callerId, key);
  if (response.failure) return ApiResult.Failed(response);

  // map summary data-model to result model
  const mappedRecords = DataSchema.mapSummaryRecord(response.content);

  return ApiResult.Succeeded(mappedRecords);
}
