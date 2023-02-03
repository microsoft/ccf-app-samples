import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../../utils/service-result";
import { IJwtIdentityProvider } from "../Jwt-validation";

export class TestIdProvider implements IJwtIdentityProvider  {
   /**
   * Check if caller's access token is valid
   * @param {JwtAuthnIdentity} identity JwtAuthnIdentity object
   * @returns {ServiceResult<string>}
   */
  public isValidJwtToken(identity: ccfapp.JwtAuthnIdentity): ServiceResult<string> {
    const identityId = identity?.jwt?.payload?.sub;
    return ServiceResult.Succeeded(identityId);
  }
}

/**
 * Export jwt validator
 */
const testIdProvider: IJwtIdentityProvider = new TestIdProvider();
export default testIdProvider;
