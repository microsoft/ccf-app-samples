// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import * as ccfapp from "@microsoft/ccf-app";
import msJwtProvider, { MSAccessToken } from "../../../../../src/auth/validator/jwt/ms-aad-jwt-provider";
import { MS_AAD_CONFIG } from "../../../../../src/utils/config";

describe("MS-AAD-Jwt-Provider", () => {
  const sub: string = "ms-aad-test";
  const iss = "https://login.microsoftonline.com/common/v2.0";
  const aud = MS_AAD_CONFIG.ApiIdentifierUri;
  const appid = MS_AAD_CONFIG.ClientApplicationId;
  const ver = "1.0";

  test("Should return the identityId", () => {
    // Arrange
    const msJwttoken: MSAccessToken = { sub: sub, iss: iss, aud: aud, appid: appid, ver: ver };
    const valid_jwt = { header: "test", keyIssuer: iss, payload: msJwttoken };
    const valid_identity: ccfapp.JwtAuthnIdentity = { policy: "jwt", jwt: valid_jwt };
    // Act
    const result = msJwtProvider.isValidJwtToken(valid_identity);

    // Assert
    expect(result.content).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.content).toBe("ms-aad-test");
  });

  test("Invalid appId, should throw authentication error", () => {
    // Arrange
    const invalid_appid: MSAccessToken = { sub: sub, iss: iss, aud: aud, appid: "test_appId", ver: ver };
    const invalid_appid_jwt = { header: "test", keyIssuer: iss, payload: invalid_appid };
    const invalid_identity: ccfapp.JwtAuthnIdentity = { policy: "jwt", jwt: invalid_appid_jwt };
    // Act
    const result = msJwtProvider.isValidJwtToken(invalid_identity);
    // Assert
    expect(result.content).toBeNull();
    expect(result.success).toBe(false);
    expect(result.error.errorType).toBe("AuthenticationError");
  });

  test("Invalid version, should throw authentication error", () => {
    // Arrange
    const invalid_version: MSAccessToken = { sub: sub, iss: iss, aud: aud, appid: appid, ver: "2.0" };
    const invalid_version_jwt = { header: "test", keyIssuer: iss, payload: invalid_version };
    const invalid_identity: ccfapp.JwtAuthnIdentity = { policy: "jwt", jwt: invalid_version_jwt };
    // Act
    const result = msJwtProvider.isValidJwtToken(invalid_identity);
    // Assert
    expect(result.content).toBeNull();
    expect(result.success).toBe(false);
    expect(result.error.errorType).toBe("AuthenticationError");
  });
});
