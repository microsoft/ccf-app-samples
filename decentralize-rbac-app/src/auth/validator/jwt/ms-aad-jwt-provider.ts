import * as ccfapp from "@microsoft/ccf-app";
import { MS_AAD_CONFIG } from "../../../utils/config";
import { ServiceResult } from "../../../utils/service-result";
import { IJwtIdentityProvider } from "./jwt-validation";

/**
 * MS Access Token
 */
export interface MSAccessToken {
  sub: string;
  iss: string;
  aud: string;
  appid: string;
  ver: string;
}

export class MsJwtProvider implements IJwtIdentityProvider {
  /**
   * Check if caller's access token is valid
   * @param {JwtAuthnIdentity} identity JwtAuthnIdentity object
   * @returns {ServiceResult<string>}
   */
  public isValidJwtToken(
    identity: ccfapp.JwtAuthnIdentity
  ): ServiceResult<string> {
    const msClaims = identity.jwt.payload as MSAccessToken;

    // check if token has the right version
    if (msClaims.ver !== "1.0") {
      return ServiceResult.Failed({
        errorMessage: "Error: unsupported access token version, must be 1.0",
        errorType: "AuthenticationError",
      });
    }

    // check if token is for this app
    if (msClaims.appid !== MS_AAD_CONFIG.ClientApplicationId) {
      return ServiceResult.Failed({
        errorMessage: "Error: jwt validation failed: appid mismatch",
        errorType: "AuthenticationError",
      });
    }

    // check if token audience is for this app
    if (msClaims.aud !== MS_AAD_CONFIG.ApiIdentifierUri) {
      return ServiceResult.Failed({
        errorMessage:
          "Error: jwt validation failed: aud mismatch (incorrect scope requested?)",
        errorType: "AuthenticationError",
      });
    }
    const identityId = identity?.jwt?.payload?.sub;
    return ServiceResult.Succeeded(identityId);
  }
}

/**
 * Export jwt validator
 */
const msJwtProvider: IJwtIdentityProvider = new MsJwtProvider();
export default msJwtProvider;
