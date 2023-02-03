import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../../utils/service-result";
import { IJwtIdentityProvider } from "../Jwt-validation";

export class TestIdProvider implements IJwtIdentityProvider  {
   /**
   * Check if caller's access token is valid
   * @param {JwtAuthnIdentity} identity JwtAuthnIdentity object
   * @returns {ServiceResult<boolean>}
   */
  public isValidJwtToken(identity: ccfapp.JwtAuthnIdentity): ServiceResult<boolean> {
    return ServiceResult.Succeeded(true);
  }
}

/**
 * Export jwt validator
 */
const testIdProvider: IJwtIdentityProvider = new TestIdProvider();
export default testIdProvider;
