import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { ServiceResult } from "../utils/service-result";

export enum AuthenticationPolicyEnum {
  User_cert = "user_cert",
  User_signature = "user_signature",
  Member_cert = "member_cert",
  Member_signature = "member_signature",
  Jwt = "jwt",
  No_auth = "no_auth"
}

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

interface JwtAuthnIdentity extends ccfapp.JwtAuthnIdentity {
  /**
  * User ID.
  */
  userId: string;
}

interface CCFMember {
  status: string;
}

interface MSAccessTokenClaims {
  sub: string;
  iss: string;
  aud: string;
  appid: string; // 1.0 only
  ver: string; // 1.0 or 2.0
}

// Replace the below string with your own app id by registering an app in Azure:
// https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app
const MS_APP_ID = "1773214f-72b8-48f9-ae18-81e30fab04db";
const MS_APP_ID_URI = "api://1773214f-72b8-48f9-ae18-81e30fab04db";

export interface IAuthenticationService {
  getCallerId(request: ccfapp.Request<any>): ServiceResult<string>;
  isUser(userId: string): ServiceResult<boolean>;
  isAuthenticated(request: ccfapp.Request<any>): ServiceResult<boolean>;
  isActiveMember(memberId: string): ServiceResult<boolean>;
}

/*
* Authentication Service
*/
export class CertBasedAuthenticationService implements IAuthenticationService {

  /*
  * get caller id
  * Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  */
  public getCallerId(request: ccfapp.Request<any>): ServiceResult<string> {
    try {
      const caller = request.caller as unknown as UserMemberAuthnIdentity;
      let callerId = caller.id;
      if (caller.policy === AuthenticationPolicyEnum.Jwt) {
        const jwtCaller = request.caller as unknown as JwtAuthnIdentity;
        callerId = jwtCaller.userId;
      }

      if (!callerId) {
        return ServiceResult.Failed({
          errorMessage: "Error: invalid caller identity",
          errorType: "AuthenticationError",
        });
      }

      return ServiceResult.Succeeded(callerId);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error getting caller identity",
        errorType: "AuthenticationError",
        details: ex,
      });
    }
  }

  // Check if user exists https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
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

  // Check if member exists https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
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

  // Check if caller a valid access token
  public isValidJwtToken(identity: JwtAuthnIdentity): ServiceResult<boolean> {

    if (!identity || !identity.userId) {
      return ServiceResult.Failed({
        errorMessage: "Error: invalid caller identity",
        errorType: "AuthenticationError",
      });
    }

    if (identity.jwt.keyIssuer === "https://demo") {
      // no further validation
    } else if (identity.jwt.keyIssuer === "https://login.microsoftonline.com/common/v2.0") {
      // Microsoft identity platform access tokens
      const msClaims = identity.jwt.payload as MSAccessTokenClaims;
      if (msClaims.ver !== "1.0") {
        return ServiceResult.Failed({
          errorMessage: "Error: unsupported access token version, must be 1.0",
          errorType: "AuthenticationError",
        });
      }
      if (msClaims.appid !== MS_APP_ID) {
        return ServiceResult.Failed({
          errorMessage: "Error: jwt validation failed: appid mismatch",
          errorType: "AuthenticationError",
        });
      }
      if (msClaims.aud !== MS_APP_ID_URI) {
        return ServiceResult.Failed({
          errorMessage: "Error: jwt validation failed: aud mismatch (incorrect scope requested?)",
          errorType: "AuthenticationError",
        });
      }
    } else {
      return ServiceResult.Failed({
        errorMessage: `Error: jwt validation failed: unknown key issuer: ${identity.jwt.keyIssuer}`,
        errorType: "AuthenticationError",
      });
    }

    return ServiceResult.Succeeded(true);

  }

  /*
  * Check if caller is a valid identity (user or member or access token)
  */
  public isAuthenticated(request: ccfapp.Request<any>): ServiceResult<boolean> {
    const commonCaller = request.caller as unknown as ccfapp.AuthnIdentityCommon;

    // check if caller has a valid access token
    if (commonCaller.policy === AuthenticationPolicyEnum.Jwt) {
      const jwtCaller = request.caller as unknown as JwtAuthnIdentity;
      const isValid = this.isValidJwtToken(jwtCaller);
      if (isValid.success && isValid.content) {
        return ServiceResult.Succeeded(true);
      }
    }
    // check if caller is a valid user
    else if (commonCaller.policy === AuthenticationPolicyEnum.User_cert || commonCaller.policy === AuthenticationPolicyEnum.User_signature) {
      const userCaller = request.caller as unknown as UserMemberAuthnIdentity;
      const identityId = userCaller.id;
      const isValid = this.isUser(identityId);
      if (isValid.success && isValid.content) {
        return ServiceResult.Succeeded(true);
      }
    }
    // check if caller is a valid member
    else if (commonCaller.policy === AuthenticationPolicyEnum.Member_cert || commonCaller.policy === AuthenticationPolicyEnum.Member_signature) {
      const memberCaller = request.caller as unknown as UserMemberAuthnIdentity;
      const identityId = memberCaller.id;
      const isValid = this.isActiveMember(identityId);
      if (isValid.success && isValid.content) {
        return ServiceResult.Succeeded(true);
      }
    }

    return ServiceResult.Failed({
      errorMessage: "Error: invalid caller identity",
      errorType: "AuthenticationError",
    });
  }
}

const authenticationService: IAuthenticationService = new CertBasedAuthenticationService();
export default authenticationService;
