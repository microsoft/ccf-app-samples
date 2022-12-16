import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { ServiceResult } from "../utils/service-result";

interface Caller {
  id: string;
}

export interface IAuthenticationService {
  getCallerId(request: ccfapp.Request<any>): ServiceResult<string>;
  isUser(userId: string): ServiceResult<boolean>;
  isMember(memberId: string): ServiceResult<boolean>;
  isValidIdentity(identityId: string): ServiceResult<boolean>;
}

// Authentication Service
export class CertBasedAuthenticationService implements IAuthenticationService {
  // get caller id
  // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  public getCallerId(request: ccfapp.Request<any>): ServiceResult<string> {
    try {
      const caller = request.caller as unknown as Caller;
      if (!caller.id) {
        return ServiceResult.Failed({
          errorMessage: "Error: invalid caller identity",
          errorType: "AuthenticationError",
        });
      }
      return ServiceResult.Succeeded(caller.id);
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

      return ServiceResult.Succeeded(usersCerts.has(ccf.strToBuf(userId)));
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error getting caller identity",
        errorType: "AuthenticationError",
        details: ex,
      });
    }
  }

  // Check if member exists https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
  public isMember(memberId: string): ServiceResult<boolean> {
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
      return ServiceResult.Succeeded(isMember);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: getting caller identity",
        errorType: "AuthenticationError",
        details: ex,
      });
    }
  }

  // Check if call is member or user
  public isValidIdentity(identityId: string): ServiceResult<boolean> {
    if (!identityId) {
      return ServiceResult.Failed({
        errorMessage: "Error: invalid caller identity",
        errorType: "AuthenticationError",
      });
    }

    const isMember = this.isMember(identityId);
    if (isMember.success && isMember.content) {
      return ServiceResult.Succeeded(true);
    }

    const isUser = this.isUser(identityId);
    if (isUser.success && isUser.content) {
      return ServiceResult.Succeeded(true);
    }

    return ServiceResult.Failed({
      errorMessage: "Error: invalid caller identity",
      errorType: "AuthenticationError",
    });
  }
}

const authenticationService: IAuthenticationService =
  new CertBasedAuthenticationService();
export default authenticationService;
