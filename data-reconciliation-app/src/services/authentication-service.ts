import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { ServiceResult } from "../utils/service-result";

/**
 * CCF authentication policies
 */
export enum CcfAuthenticationPolicyEnum {
  User_cert = "user_cert",
  User_signature = "user_signature",
  Member_cert = "member_cert",
  Member_signature = "member_signature",
  Jwt = "jwt",
  No_auth = "no_auth"
}

/**
 * CCF user and member authentication identity
 */
interface UserMemberAuthnIdentity extends ccfapp.AuthnIdentityCommon {
  /**
   * User/member ID.
   */
  id: string;
  /**
   * User/member data object.
   */
  data: any;
  /**
   * PEM-encoded user/member certificate.
   */
  cert: string;
  /**
   * A string indicating which policy accepted this request,
   * for use when multiple policies are listed in the endpoint
   * configuration of ``app.json``.
   */
  policy: string;
}

/**
 * CCF member information
 * https://microsoft.github.io/CCF/main/audit/builtin_maps.html#members-info
 */
interface CCFMember {
  status: string;
}

/**
 * Microsoft Identity provider Access Token
 */
interface MSAccessToken {
  sub: string;
  iss: string;
  aud: string;
  appid: string;
  ver: string;
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

  /**
   * Checks if a user exists
   * @see https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
   * @param {string} userId userId to check if it exists
   * @returns {ServiceResult<boolean>}
   */
  isUser(userId: string): ServiceResult<boolean>;

  /**
   * Checks if a member exists and active
   * @see https://microsoft.github.io/CCF/main/audit/builtin_maps.html#members-info
   * @param {string} memberId memberId to check if it exists and active
   * @returns {ServiceResult<boolean>}
   */
  isActiveMember(memberId: string): ServiceResult<boolean>;
}

/**
 * Authentication Service Implementation
 */
export class AuthenticationService implements IAuthenticationService {

  /*
   * Check if caller is a valid identity (user or member or access token)
   */
  public isAuthenticated(request: ccfapp.Request<any>): ServiceResult<string> {
    const commonCaller = request.caller as unknown as ccfapp.AuthnIdentityCommon;

    switch (commonCaller.policy) {
      // check if caller has a valid access token
      case CcfAuthenticationPolicyEnum.Jwt: {
        const jwtCaller = request.caller as unknown as ccfapp.JwtAuthnIdentity;
        const isValid = this.isValidJwtToken(jwtCaller);
        if (isValid.success && isValid.content) {
          const identityId = jwtCaller?.jwt?.payload?.sub;
          return ServiceResult.Succeeded(identityId);
        }
      }
      // check if caller is a valid user
      case CcfAuthenticationPolicyEnum.User_cert:
      case CcfAuthenticationPolicyEnum.User_signature: {
        const userCaller = request.caller as unknown as UserMemberAuthnIdentity;
        const identityId = userCaller.id;
        const isValid = this.isUser(identityId);
        if (isValid.success && isValid.content) {
          return ServiceResult.Succeeded(identityId);
        }
      }
      // check if caller is a valid member
      case CcfAuthenticationPolicyEnum.Member_cert:
      case CcfAuthenticationPolicyEnum.Member_signature: {
        const memberCaller = request.caller as unknown as UserMemberAuthnIdentity;
        const identityId = memberCaller.id;
        const isValid = this.isActiveMember(identityId);
        if (isValid.success && isValid.content) {
          return ServiceResult.Succeeded(identityId);
        }
      }
    }

    return ServiceResult.Failed({
      errorMessage: "Error: invalid caller identity",
      errorType: "AuthenticationError"
    });
  }

  /**
   * Checks if a user exists
   * @see https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
   * @param {string} userId userId to check if it exists
   * @returns {ServiceResult<boolean>}
   */
  public isUser(userId: string): ServiceResult<boolean> {
    try {
      if (!userId) {
        return ServiceResult.Failed({
          errorMessage: "Error: invalid user id",
          errorType: "AuthenticationError",
        });
      }

      const usersCerts = ccfapp.typedKv(
        "public:ccf.gov.users.certs",
        ccfapp.arrayBuffer,
        ccfapp.arrayBuffer
      );
      const result = usersCerts.has(ccf.strToBuf(userId));
      return ServiceResult.Succeeded(result);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error getting caller identity",
        errorType: "AuthenticationError",
        details: ex,
      });
    }
  }

  /**
   * Checks if a member exists and active
   * @see https://microsoft.github.io/CCF/main/audit/builtin_maps.html#members-info
   * @param {string} memberId memberId to check if it exists and active
   * @returns {ServiceResult<boolean>}
   */
  public isActiveMember(memberId: string): ServiceResult<boolean> {
    try {
      if (!memberId) {
        return ServiceResult.Failed({
          errorMessage: "Error: invalid member id",
          errorType: "AuthenticationError",
        });
      }

      const membersCerts = ccfapp.typedKv(
        "public:ccf.gov.members.certs",
        ccfapp.arrayBuffer,
        ccfapp.arrayBuffer
      );

      const isMember = membersCerts.has(ccf.strToBuf(memberId));

      const membersInfo = ccfapp.typedKv(
        "public:ccf.gov.members.info",
        ccfapp.arrayBuffer,
        ccfapp.arrayBuffer
      );

      const memberInfoBuf = membersInfo.get(ccf.strToBuf(memberId));
      const memberInfo = ccf.bufToJsonCompatible(memberInfoBuf) as CCFMember;
      const isActiveMember = memberInfo && memberInfo.status === "Active";

      return ServiceResult.Succeeded(isActiveMember && isMember);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: getting caller identity",
        errorType: "AuthenticationError",
        details: ex,
      });
    }
  }

  /**
   * Check if caller's access token is valid
   * @param {JwtAuthnIdentity} identity JwtAuthnIdentity object
   * @returns {ServiceResult<boolean>}
   */
  public isValidJwtToken(identity: ccfapp.JwtAuthnIdentity): ServiceResult<boolean> {

    if (!identity || !identity.jwt || !identity.jwt.payload || !identity.jwt.payload.sub) {
      return ServiceResult.Failed({
        errorMessage: "Error: invalid caller identity",
        errorType: "AuthenticationError",
      });
    }

    // Need to run another round of enhancement by spliting the implementation
    // into separate services per identity provider
    // https://github.com/orgs/microsoft/projects/542/views/1?pane=issue&itemId=19232592
    if (identity.jwt.keyIssuer === "https://demo") { 
      // custom logic to validate the tokens of demo issuer
      // Todo: add token signature validation
      // no further validation
    }
    else if (identity.jwt.keyIssuer === "https://login.microsoftonline.com/common/v2.0") { 
      // custom logic to validate the tokens of microsoft Idp
      // Todo: add token signature validation
      
      // Microsoft identity platform access tokens
      const msClaims = identity.jwt.payload as MSAccessToken;
      
      // check if token has the right version
      if (msClaims.ver !== "1.0") {
        return ServiceResult.Failed({
          errorMessage: "Error: unsupported access token version, must be 1.0",
          errorType: "AuthenticationError",
        });
      }

      // Replace the below string with your own app id by registering an app in Azure:
      // https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app
      // MS_APP_ID and MS_APP_ID_URI added here for clarity
      // In production, both the MS_APP_ID and MS_APP_ID_URI should be read from the configuration store 
      const MS_APP_ID = "ee48548a-7d69-4b8e-b2d4-805e8bac7f01";
      const MS_APP_ID_URI = "api://b8dbd573-a015-424b-b111-2d5fa11cee3c";

      // check if token is for this app
      if (msClaims.appid !== MS_APP_ID) {
        return ServiceResult.Failed({
          errorMessage: "Error: jwt validation failed: appid mismatch",
          errorType: "AuthenticationError",
        });
      }

      // check if token audience is for this app
      if (msClaims.aud !== MS_APP_ID_URI) {
        return ServiceResult.Failed({
          errorMessage: "Error: jwt validation failed: aud mismatch (incorrect scope requested?)",
          errorType: "AuthenticationError",
        });
      }
    } else {
      // Jwt issuer if not supported
      return ServiceResult.Failed({
        errorMessage: `Error: jwt validation failed: unknown key issuer: ${identity.jwt.keyIssuer}`,
        errorType: "AuthenticationError",
      });
    }

    return ServiceResult.Succeeded(true);
  }
}

/**
 * Export the authentication service
 */
const authenticationService: IAuthenticationService = new AuthenticationService();
export default authenticationService;
