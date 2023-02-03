import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { IValidatorService } from "../auth/Jwt-validation";
import jwtValidator from "../auth/Jwt-validation";
import userCertValidator from "../auth/UserCert-validation";
import memberCertValidator from "../auth/MemberCert-validation";

/**
 * CCF authentication policies
 */
export enum CcfAuthenticationPolicyEnum {
  User_cert = "user_cert",
  User_signature = "user_signature",
  Member_cert = "member_cert",
  Member_signature = "member_signature",
  Jwt = "jwt"
}

/**
 * Authentication Service Interface
 */
export interface IAuthenticationService {
  /**
   * Checks if caller is an active member or a registered user or has a valid JWT token
   * @param {string} identityId userId extracted from mTLS certificate
   * @returns {ServiceResult<boolean>}
   */
  isAuthenticated(request: ccfapp.Request<any>): ServiceResult<string>;
}

/**
 * Authentication Service Implementation
 */
export class AuthenticationService implements IAuthenticationService {
  private readonly validators = new Map<CcfAuthenticationPolicyEnum, IValidatorService>();

  constructor() {
    this.validators.set(CcfAuthenticationPolicyEnum.Jwt, jwtValidator);
    this.validators.set(CcfAuthenticationPolicyEnum.User_cert, userCertValidator)
    this.validators.set(CcfAuthenticationPolicyEnum.User_signature, userCertValidator);
    this.validators.set(CcfAuthenticationPolicyEnum.Member_cert, memberCertValidator);
    this.validators.set(CcfAuthenticationPolicyEnum.Member_signature, memberCertValidator);
}

  /*
   * Check if caller is a valid identity (user or member or access token)
   */
  public isAuthenticated(request: ccfapp.Request<any>): ServiceResult<string> {
    try {
      const commonCaller = request.caller as unknown as ccfapp.AuthnIdentityCommon;
      const authPolicy = this.validators.get(<CcfAuthenticationPolicyEnum>commonCaller.policy);
      return authPolicy.validate(request);

    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: invalid caller identity",
        errorType: "AuthenticationError"
      });  
    }
  }
}

/**
 * Export the authentication service
 */
const authenticationService: IAuthenticationService = new AuthenticationService();
export default authenticationService;
