import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import userService from "../services/user-service";
import { ServiceResult } from "../utils/service-result";

/**
 * HTTP GET Handler for checking if a user exists
 * @param {ccfapp.Request<any>} request - mTLS request with userid and role
 * @returns {string} - userid has been added successfully
 */
export function add_user(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isAuthenticated(request);
  if (isValidIdentity.failure)
    return ApiResult.AuthFailure();

  const userId = request.params.user_id;
  const role = request.params.role;
  
  // check if the user exist
  const response = userService.add_user(userId, role);
  if (response.success){
    return ApiResult.Html("Ok");
  } else {
    return ApiResult.Failed(ServiceResult.Failed({
      errorMessage: "user add failed",
      errorType: "Invalid data"
    }));
  }
}
