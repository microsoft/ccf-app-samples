// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import * as ccfapp from "@microsoft/ccf-app";
import demoJwtProvider from "../../../../../src/auth/validator/jwt/demo-jwt-provider";

describe("Demo-Jwt-Provider", () => {
  let sub: string = "test";
  let iss = "https://demo";

  const jwt = { header: "test", keyIssuer: iss, payload: { sub: sub } };
  const identity: ccfapp.JwtAuthnIdentity = { policy: "jwt", jwt: jwt };

  beforeEach(() => {});
  afterEach(() => {});

  test("Should return the identityId", () => {
    // Arrange
    // Act
    const result = demoJwtProvider.isValidJwtToken(identity);

    // Assert
    expect(result.content).not.toBeNull();
    expect(result.content).toBe("test");
  });
});
