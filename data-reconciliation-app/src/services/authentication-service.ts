import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { User } from "../models/user";


interface Caller {
    id: string;
}

export interface IAuthenticationService {
    getCallerId(request: ccfapp.Request<any>): string;
    isUser(userId: string): boolean;
    isMember(memberId: string): boolean;
    isValidIdentity(identityId: string): boolean;
}

// Authentication Service
// This is an initial implementation based on banking-app sample
// will be revisited on authentication implementation user-story 
export class AuthenticationService implements IAuthenticationService {
 
     // get caller id
     // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
    public getCallerId(request: ccfapp.Request<any>): User {
       
        const caller = request.caller as unknown as Caller;
        return caller.id;
      }
      
      // Check if user exists https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
      public isUser(userId: string): boolean {

        const usersCerts = ccfapp.typedKv(
          "public:ccf.gov.users.certs",
          ccfapp.arrayBuffer,
          ccfapp.arrayBuffer
        );
        return usersCerts.has(ccf.strToBuf(userId));
      }
      
      // Check if member exists https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
      public isMember(memberId: string): boolean {

        const membersCerts = ccfapp.typedKv(
          "public:ccf.gov.members.certs",
          ccfapp.arrayBuffer,
          ccfapp.arrayBuffer
        );
        return membersCerts.has(ccf.strToBuf(memberId));
      }

      public isValidIdentity(identityId: string): boolean {

        return this.isMember(identityId) || this.isUser(identityId);
      }
}