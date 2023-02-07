import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { ServiceResult } from "../../../utils/service-result";
import { IValidatorService } from "../validation-service";
import { UserMemberAuthnIdentity } from "./user-cert-validation";

/**
 * CCF member information
 * https://microsoft.github.io/CCF/main/audit/builtin_maps.html#members-info
 */
interface CCFMember {
  status: string;
}

export class MemberCertValidator implements IValidatorService {
  validate(request: ccfapp.Request<any>): ServiceResult<string> {
    const memberCaller = request.caller as unknown as UserMemberAuthnIdentity;
    const identityId = memberCaller.id;
    const isValid = this.isActiveMember(identityId);
    if (isValid.success && isValid.content) {
      return ServiceResult.Succeeded(identityId);
    }
    return ServiceResult.Failed({
      errorMessage: "Error: invalid caller identity",
      errorType: "AuthenticationError",
    });
  }

  /**
   * Checks if a member exists and active
   * @see https://microsoft.github.io/CCF/main/audit/builtin_maps.html#members-info
   * @param {string} memberId memberId to check if it exists and active
   * @returns {ServiceResult<boolean>}
   */
  public isActiveMember(memberId: string): ServiceResult<boolean> {
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
  }
}

/**
 * Export the member cert validator
 */
const memberCertValidator: IValidatorService = new MemberCertValidator();
export default memberCertValidator;
