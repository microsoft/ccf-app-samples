import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import authzService from "../services/authz-service";
import { ServiceResult } from "../utils/service-result";
import { Service } from "protobufjs";

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
  const action = request.params.actionName;

  if (!userId || !action){
    return ApiResult.Failed(ServiceResult.Failed({
      errorMessage: "userId and action are required",
      errorType: "InvalidData"
    }, 400));
  }
  
  // check if the user exist
  const response = authzService.authorize(userId, action);
  if (response.success)
  {
    return ApiResult.ActionAllowed(response);
  } 
  else 
  {
    return ApiResult.ActionDisallowed(response);
  }
}
