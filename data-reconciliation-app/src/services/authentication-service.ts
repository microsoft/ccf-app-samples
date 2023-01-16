import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { ServiceResult } from "../utils/service-result";

interface Caller {
  id: string;
}

export interface CCFMember {
  status: string;
}

export interface IAuthenticationService {
  getCallerId(request: ccfapp.Request<any>): ServiceResult<string>;
  isUser(userId: string): ServiceResult<boolean>;
  isValidIdentity(identityId: string): ServiceResult<boolean>;
  isActiveMember(memberId: string): ServiceResult<boolean>;
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

  // Check if caller is an active member or an user registered in the network
  public isValidIdentity(identityId: string): ServiceResult<boolean> {
    if (!identityId) {
      return ServiceResult.Failed({
        errorMessage: "Error: invalid caller identity",
        errorType: "AuthenticationError",
      });
    }

    const isMember = this.isActiveMember(identityId);
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
