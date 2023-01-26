import jwt from "jsonwebtoken";
import * as fs from "fs";
import * as crypto from "crypto";
import forge from "node-forge";
import { KeyPairSyncResult } from "crypto";
import axios from 'axios';

/*
   * Create the JWT issuer configs for (Test - Microsoft Azure Identity Provider).
   * This config will be used in sandbox and as proposal for docker and mCCF.
  */

export class JwtConfigsGenerator {

  public static workspaceFolderPath: string = "./workspace/configs";

  /*  
   * Create a test Identity Provider configs for sandbox and proposal for docker and mCCF.
   */
  public static async createSandbox_Test_JwtIssuer_Config(): Promise<any> {

    const proposalFilePath = `${this.workspaceFolderPath}/set_jwt_issuer_test_proposal.json`;
    const sandboxConfigFilePath = `${this.workspaceFolderPath}/set_jwt_issuer_test_sandbox.json`;
    if (fs.existsSync(sandboxConfigFilePath) && fs.existsSync(proposalFilePath)) 
      return;

    // make sure the workspace folder exists.
    await fs.promises.mkdir(this.workspaceFolderPath, { recursive: true }).catch(console.error);

    let keyId: string = "12345";
    let issuer: string = "https://demo";
    let keys: KeyPairSyncResult<string, string>;

    // Generate a new encryption key pair
    keys = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Create a self-signed certificate
    const cert = forge.pki.createCertificate();
    const attrs = [{ name: "commonName", value: "Test" }];
    cert.setIssuer(attrs);
    cert.publicKey = forge.pki.publicKeyFromPem(keys.publicKey);
    cert.sign(forge.pki.privateKeyFromPem(keys.privateKey), forge.md.sha256.create());
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const certDerB64 = forge.util.encode64(certDer);
    const jwtIssuer = {
      issuer: issuer,
      jwks: { keys: [{ kty: "RSA", kid: keyId, x5c: [certDerB64] }] },
      tokens: {},
    };

    // generate some tokens to be used in the tests.
    let tokens = {};
    for (let i = 1; i <= 5; i++) {
      let userId = crypto.randomUUID();
      let token = jwt.sign({ sub: userId, aud: "demo" }, keys.privateKey, {
        algorithm: "RS256",
        issuer: issuer,
        keyid: keyId,
      });
      tokens[`_test_token_${i}`] = `Bearer ${token}`;
    }

    jwtIssuer.tokens = tokens;

    // create sandbox config file for the test jwt issuer.
    fs.writeFileSync(sandboxConfigFilePath, JSON.stringify(jwtIssuer));

    // create a proposal object for the test jwt issuer, this will be submitted as proposal
    const jwtIssuerProposal = {
      "actions": [
        {
          "name": "set_jwt_issuer",
          "args": {
            "issuer": issuer,
            "key_filter": "all",
            "auto_refresh": false
          }
        },
        {
          "name": "set_jwt_public_signing_keys",
          "args": {
            "issuer": issuer,
            "jwks": jwtIssuer.jwks
          }
        }
      ]
    };

    // save the proposal to file if not exists
    fs.writeFileSync(proposalFilePath, JSON.stringify(jwtIssuerProposal));

    return jwtIssuer;
  }

  /**   
   * Create Microsoft Azure Identity Provider configs for sandbox and as proposal for docker and mCCF.
   */
  public static async create_MSIdp_JwtIssuer_Configs(): Promise<any> {

    const proposalFilePath = `${this.workspaceFolderPath}/set_jwt_issuer_ms_proposal.json`;
    const sandboxConfigFilePath = `${this.workspaceFolderPath}/set_jwt_issuer_ms_sandbox.json`;
    if (fs.existsSync(sandboxConfigFilePath) && fs.existsSync(proposalFilePath)) 
      return;

    // make sure the workspace folder exists.
    await fs.promises.mkdir(this.workspaceFolderPath, { recursive: true }).catch(console.error);

    // Microsoft IDP configs are provided by:https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
    // Microsoft IDP Keys are provided by: https://login.microsoftonline.com/common/discovery/v2.0/keys
    let issuer: string = "https://login.microsoftonline.com/common/v2.0";
    const ms_openid_config = await axios.get(`${issuer}/.well-known/openid-configuration`, {});
    const ms_jwks = await axios.get(ms_openid_config.data.jwks_uri, {});

    // create the sandbox config file for Microsoft IDP.
    const jwtIssuer = { issuer: issuer, jwks: ms_jwks.data };
    fs.writeFileSync(sandboxConfigFilePath, JSON.stringify(jwtIssuer));

    // create the proposal object for Microsoft IDP, this will be submitted as proposal.
    const jwtIssuerProposal = {
      "actions": [
        {
          "name": "set_jwt_issuer",
          "args": {
            "issuer": issuer,
            "key_filter": "all",
            "auto_refresh": false
          }
        },
        {
          "name": "set_jwt_public_signing_keys",
          "args": {
            "issuer": issuer,
            "jwks": ms_jwks.data
          }
        }
      ]
    };

    // save the proposal to file if not exists
    fs.writeFileSync(proposalFilePath, JSON.stringify(jwtIssuerProposal));
    return jwtIssuerProposal;
  }
}

await JwtConfigsGenerator.createSandbox_Test_JwtIssuer_Config();
await JwtConfigsGenerator.create_MSIdp_JwtIssuer_Configs();

console.log(`JWT issuer configs are generated successfully!, Path: ${JwtConfigsGenerator.workspaceFolderPath}`);