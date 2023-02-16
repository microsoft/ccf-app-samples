// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import * as ccfapp from "@microsoft/ccf-app";
import exp from "constants";
import jwtValidator from "../../../../../src/auth/validator/jwt/jwt-validation";
import { MSAccessToken } from "../../../../../src/auth/validator/jwt/ms-aad-jwt-provider";
import { MS_AAD_CONFIG } from "../../../../../src/utils/config";

describe("Jwt-Validator", () => {
  let iss = "https://login.microsoftonline.com/common/v2.0";
  let aud = MS_AAD_CONFIG.ApiIdentifierUri;
  let appid = MS_AAD_CONFIG.ClientApplicationId;
  let ver = "1.0";

  let header = { key1: "value1" };
  let param = { param1: "value1" };
  let test_body: ccfapp.Body = null;

  beforeEach(() => {});
  afterEach(() => {});

  test("Should return the identityId", () => {
    // Arrange
    const ms_jwt_token: MSAccessToken = { sub: "test-ms-aad", iss: iss, aud: aud, appid: appid, ver: ver };
    const ms_aad_jwt = { header: "test", keyIssuer: iss, payload: ms_jwt_token };
    const ms_aad_identity: ccfapp.JwtAuthnIdentity = { policy: "jwt", jwt: ms_aad_jwt };
    const ms_aad_request: ccfapp.Request<any> = { headers: header, params: param, path: "path", url: "url", route: "", query: "", hostname: "hostname", method: "post", body: test_body, caller: ms_aad_identity };

    // Act
    const result = jwtValidator.validate(ms_aad_request);

    // Assert
    expect(result.success).toBe(true);
    expect(result.content).not.toBeNull();
    expect(result.content).toBe("test-ms-aad");
  });

  test("Should return the identityId", () => {
    // Arrange
    const demo_jwt = { header: "test", keyIssuer: "https://demo", payload: { sub: "test" } };
    const demo_identity: ccfapp.JwtAuthnIdentity = { policy: "jwt", jwt: demo_jwt };
    const demo_request: ccfapp.Request<any> = { headers: header, params: param, path: "path", url: "url", route: "", query: "", hostname: "hostname", method: "post", body: test_body, caller: demo_identity };

    // Act
    const result = jwtValidator.validate(demo_request);

    // Assert
    expect(result.success).toBe(true);
    expect(result.content).not.toBeNull();
    expect(result.content).toBe("test");
  });
});
