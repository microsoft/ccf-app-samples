import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import authzService from "../services/authz-service";

/**
 * HTTP GET Handler for checking if a user exists
 * @param {ccfapp.Request<any>} request - mTLS request with userId and CSV file for ingestion
 * @returns {ServiceResult<string>} - data has been ingested successfully
 */
export function authorize(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isAuthenticated(request);
  if (isValidIdentity.failure)
    return ApiResult.AuthFailure();

  const userId = request.params.user_id;
  
  // check if the user exist
  const response = authzService.authorize(userId);
  return ApiResult.Succeeded(response);
}
