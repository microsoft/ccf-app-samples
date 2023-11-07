import * as ccfapp from "@microsoft/ccf-app";
import { ApiResult, CCFResponse } from "../utils/api-result";
import authenticationService from "../services/authentication-service";
import roleService from "../services/role-service";
import { ServiceResult } from "../utils/service-result";

/**
 * HTTP GET Handler for checking if a user exists
 * @param {ccfapp.Request<any>} request - mTLS request with role and allowed action
 * @returns {string} - role has been added successfully
 */
export function add_role(
  request: ccfapp.Request<any>,
): ccfapp.Response<CCFResponse> {
  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isAuthenticated(request);
  if (isValidIdentity.failure) return ApiResult.AuthFailure();

  const role = request.params.role;
  const action = request.params.action;

  if (!role || !action) {
    return {
      statusCode: 400,
    };
  }

  const response = roleService.add_role(role, action);

  if (response.success) {
    return ApiResult.Html("Ok");
  } else {
    return ApiResult.Failed(
      ServiceResult.Failed({
        errorMessage: "role add failed",
        errorType: "Invalid data",
      }),
    );
  }
}
