/** 
 * To generate Microsoft Azure Active Directory config
 * Run `make deploy-ms-idp` command to create the required application registrations.
 * Update the following variables with the ones from ./aad.env
 */

export const MS_AAD_CONFIG = {

    /**
     * Application registrations Directory (tenant) ID
     */
    TenantId: "16b3c013-d300-468d-ac64-7eda0820b6d3",

    /**
     * Client Application registration Id
     */
    ClientApplicationId: "ee48548a-7d69-4b8e-b2d4-805e8bac7f01",

    /**
     * API Application registration Id
     */
    ApiApplicationId: "b8dbd573-a015-424b-b111-2d5fa11cee3c",

    /**
     * API Application registration "Application ID URI"
     * The globally unique URI used to identify this web API. 
     * It is the prefix for scopes and in access tokens, 
     * it is the value of the audience claim. Also referred to as an identifier URI.
     */
    ApiIdentifierUri: "api://b8dbd573-a015-424b-b111-2d5fa11cee3c",

    /**
     * API Scopes used for user authorization
     */
    ApiScopes: { "api://b8dbd573-a015-424b-b111-2d5fa11cee3c/user_impersonation": "User Impersonation" }

};


