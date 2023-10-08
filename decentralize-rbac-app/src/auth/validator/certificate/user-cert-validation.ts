import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { ServiceResult } from "../../../utils/service-result";
import { IValidatorService } from "../validation-service";
/**
 * CCF user and member authentication identity
 */
export interface UserMemberAuthnIdentity extends ccfapp.AuthnIdentityCommon {
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

export class UserCertValidator implements IValidatorService {
  validate(request: ccfapp.Request<any>): ServiceResult<string> {
    const userCaller = request.caller as unknown as UserMemberAuthnIdentity;
    const identityId = userCaller.id;
    const isValid = this.isUser(identityId);
    if (isValid.success && isValid.content) {
      return ServiceResult.Succeeded(identityId);
    }
    return ServiceResult.Failed({
      errorMessage: "Error: invalid caller identity",
      errorType: "AuthenticationError",
    });
  }

  /**
   * Checks if a user exists
   * @see https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
   * @param {string} userId userId to check if it exists
   * @returns {ServiceResult<boolean>}
   */
  public isUser(userId: string): ServiceResult<boolean> {
    const usersCerts = ccfapp.typedKv(
      "public:ccf.gov.users.certs",
      ccfapp.arrayBuffer,
      ccfapp.arrayBuffer
    );
    const result = usersCerts.has(ccf.strToBuf(userId));
    return ServiceResult.Succeeded(result);
  }
}

/**
 * Export the user cert validator
 */
const userCertValidator: IValidatorService = new UserCertValidator();
export default userCertValidator;
