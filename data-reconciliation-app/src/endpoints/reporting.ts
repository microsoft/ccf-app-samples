import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import reportingService from "../services/reporting-service";
import { DataSchema } from "../models/data-schema";

/**
 * HTTP GET Handler for generating a reconciliation report with all records
 * @param {ccfapp.Request<any>} request - mTLS request with userId
 * @returns {ServiceResult<object[]>} - Reconciliation report
 */
export function getAllHandler(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {

  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isAuthenticated(request);
  if (isValidIdentity.failure)
    return ApiResult.AuthFailure();

  // caller unique identifier
  const callerId = isValidIdentity.content;

  const response = reportingService.getData(callerId);
  if (response.failure) return ApiResult.Failed(response);

  // map summary data-model to result model
  const mappedRecords = DataSchema.mapSummaryRecords(response.content);

  return ApiResult.Succeeded(mappedRecords);
}

/**
 * HTTP GET Handler for generating a reconciliation report for a recordId
 * @param {ccfapp.Request<any>} request - mTLS request with userId and recordId
 * @returns {ServiceResult<object[]>} - Reconciliation report
 */
export function getByIdHandler(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {

  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isAuthenticated(request);
  if (isValidIdentity.failure)
    return ApiResult.AuthFailure();

  // caller unique identifier
  const callerId = isValidIdentity.content;

  // get record key from request parameters
  const key = request.params["id"];

  // get report summary data
  const response = reportingService.getDataById(callerId, key);
  if (response.failure) return ApiResult.Failed(response);

  // map summary data-model to result model
  const mappedRecords = DataSchema.mapSummaryRecord(response.content);

  return ApiResult.Succeeded(mappedRecords);
}
