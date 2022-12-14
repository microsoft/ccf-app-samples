import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { User } from "../models/user";
import { ServiceResult } from "../utils/service-result";

interface Caller {
  id: string;
}

export interface IAuthenticationService {
  getCallerId(request: ccfapp.Request<any>): ServiceResult<User>;
  isUser(userId: string): ServiceResult<boolean>;
  isMember(memberId: string): ServiceResult<boolean>;
}

// Authentication Service
export class AuthenticationService implements IAuthenticationService {
  // get caller id
  // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  public getCallerId(request: ccfapp.Request<any>): ServiceResult<User> {
    try {
      const caller = request.caller as unknown as Caller;
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
      const membersCerts = ccfapp.typedKv(
        "public:ccf.gov.members.certs",
        ccfapp.arrayBuffer,
        ccfapp.arrayBuffer
      );
      return ServiceResult.Succeeded(membersCerts.has(ccf.strToBuf(memberId)));
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error getting caller identity",
        errorType: "AuthenticationError",
        details: ex,
      });
    }
  }
}
