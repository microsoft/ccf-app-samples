import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../../../utils/service-result";
import { IValidatorService } from "../validation-service";
import msJwtProvider from "./ms-aad-jwt-provider";
import testJwtProvider from "./demo-jwt-provider";

/**
 * JWT Identity Providers
 */
export enum JwtIdentityProviderEnum {
  MS_AAD = "https://login.microsoftonline.com/common/v2.0",
  Demo = "https://demo",
}
type identityId = string;

export interface IJwtIdentityProvider {
  isValidJwtToken(identity: ccfapp.JwtAuthnIdentity): ServiceResult<identityId>;
}

export class JwtValidator implements IValidatorService {
  private readonly identityProviders = new Map<
    JwtIdentityProviderEnum,
    IJwtIdentityProvider
  >();

  constructor() {
    this.identityProviders.set(JwtIdentityProviderEnum.MS_AAD, msJwtProvider);
    this.identityProviders.set(JwtIdentityProviderEnum.Demo, testJwtProvider);
  }

  validate(request: ccfapp.Request<any>): ServiceResult<identityId> {
    const jwtCaller = request.caller as unknown as ccfapp.JwtAuthnIdentity;
    const provider = this.identityProviders.get(
      <JwtIdentityProviderEnum>jwtCaller.jwt.keyIssuer
    );
    return provider.isValidJwtToken(jwtCaller);
  }
}

/**
 * Export jwt validator
 */
const jwtValidator: IValidatorService = new JwtValidator();
export default jwtValidator;
