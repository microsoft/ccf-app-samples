import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../../utils/service-result";
import { IJwtIdentityProvider } from "../Jwt-validation";

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

export class MsIdProvider implements IJwtIdentityProvider  {
   /**
   * Check if caller's access token is valid
   * @param {JwtAuthnIdentity} identity JwtAuthnIdentity object
   * @returns {ServiceResult<string>}
   */
  public isValidJwtToken(identity: ccfapp.JwtAuthnIdentity): ServiceResult<string> {
      
    const msClaims = identity.jwt.payload as MSAccessToken;
      
    // check if token has the right version
    if (msClaims.ver !== "1.0") {
      return ServiceResult.Failed({
        errorMessage: "Error: unsupported access token version, must be 1.0",
        errorType: "AuthenticationError",
      });
    }

    // Replace the below string with your own app id by registering an app in Azure:
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app
    // MS_APP_ID and MS_APP_ID_URI added here for clarity
    // In production, both the MS_APP_ID and MS_APP_ID_URI should be read from the configuration store 
    const MS_APP_ID = "ee48548a-7d69-4b8e-b2d4-805e8bac7f01";
    const MS_APP_ID_URI = "api://b8dbd573-a015-424b-b111-2d5fa11cee3c";

    // check if token is for this app
    if (msClaims.appid !== MS_APP_ID) {
      return ServiceResult.Failed({
        errorMessage: "Error: jwt validation failed: appid mismatch",
        errorType: "AuthenticationError",
      });
    }

    // check if token audience is for this app
    if (msClaims.aud !== MS_APP_ID_URI) {
      return ServiceResult.Failed({
        errorMessage: "Error: jwt validation failed: aud mismatch (incorrect scope requested?)",
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
const msIdProvider: IJwtIdentityProvider = new MsIdProvider()
export default msIdProvider;
