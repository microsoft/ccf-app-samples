import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import msIdProvider from "./jwtIssuer/MS-AAD";
import testIdProvider from "./jwtIssuer/TestIdP";

/**
   * JWT Token attributes
*/
export interface JwtToken {
    sub: string;
    iss: string;
    aud: string;
    appid: string;
    ver: string;
}

/**
 * JWT Identity Providers
*/
export enum JwtIdentityProviderEnum {
    MS_AAD = "https://login.microsoftonline.com/common/v2.0",
    Test = "https://demo"
}

export interface IJwtIdentityProvider {
    isValidJwtToken(identity: ccfapp.JwtAuthnIdentity): ServiceResult<boolean>
}

type identityId = string;

export interface IValidatorService {
    validate(request: ccfapp.Request<any>): ServiceResult<identityId>
}

export class JwtValidator implements IValidatorService  {
    private readonly identityProviders = new Map<JwtIdentityProviderEnum, IJwtIdentityProvider>();

  constructor() {
    this.identityProviders.set(JwtIdentityProviderEnum.MS_AAD, msIdProvider);
    this.identityProviders.set(JwtIdentityProviderEnum.Test, testIdProvider);
}

    validate(request: ccfapp.Request<any>): ServiceResult<identityId> {
        const jwtCaller = request.caller as unknown as ccfapp.JwtAuthnIdentity;
        const provider = this.identityProviders.get(<JwtIdentityProviderEnum>jwtCaller.jwt.keyIssuer);
        const isValid  =  provider.isValidJwtToken(jwtCaller);

        if (isValid.success && isValid.content) {
            const identityId = jwtCaller?.jwt?.payload?.sub;
            return ServiceResult.Succeeded(identityId);
        }
        return ServiceResult.Failed({
            errorMessage: `Error: jwt validation failed: unknown key issuer: ${jwtCaller.jwt.keyIssuer}`,
            errorType: "AuthenticationError",
          });
    }
}

/**
 * Export jwt validator
 */
const jwtValidator: IValidatorService = new JwtValidator()
export default jwtValidator;
