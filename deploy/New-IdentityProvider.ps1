<#
.Description
This allows you to create an Identity Provider for providing tokens
to an application - this is optional.
 
#> 

[CmdletBinding()]
param(
    # The name of the AAD Client Application
    [Parameter(Mandatory=$false)]
    [string] $AADClientAppName="ccf_demo_client",
    # The name of the AAD API Application
    [Parameter(Mandatory=$false)]
    [string] $AADApiAppName="ccf_demo_api",
    # Tenant of the Service Principal
    # TODO
    [Parameter(Mandatory=$false)]
    [string] $TenantId="c078b137-176d-4417-b8ee-f566eeed1eb9"
)

# Connect with the correct scopes that you need to perform the management operations.
# These are not the scopes you are granting to the applications.
$RequiredScopes = @("Directory.AccessAsUser.All", "Directory.ReadWrite.All", "Application.ReadWrite.All")
Connect-MgGraph -TenantId $TenantId -Scopes $RequiredScopes

# 1. Create the application that secures the API. This needs a secret
# https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplication?view=graph-powershell-1.0
$userImpersonationScopeId=New-Guid
$api_app_manifest = @{
    DisplayName = $AADApiAppName
    SignInAudience = "AzureADMyOrg"
    API = @{
        Oauth2PermissionScopes = @(
            @{
                Id=$userImpersonationScopeId
                IsEnabled = true
                Type = "User"
                AdminConsentDescription = "Access this API on behalf of a signed in user"
                AdminConsentDisplayName = "User Impersonation (admin)"
                UserConsentDescription = "Access this API on behalf of a signed in user"
                UserConsentDisplayName = "User Impersonation"
                Value = "user_impersonation"
            }
        )
    }        
}
$api_app = New-MgApplication @api_app_manifest
$api_app | Format-List AppId

# This application needs an Application ID URI so we can uniquely reference it as a Scope
Update-MgApplication -ApplicationId $api_app.Id -IdentifierUris @("api://$($api_app.AppId)")

# 2. Now add a password and it will be returned to you, only the first time around.
$passwordCred = @{
   displayName = 'Created in PowerShell'
   endDateTime = (Get-Date).AddMonths(6)
}

# https://learn.microsoft.com/en-us/powershell/module/az.resources/new-azadappcredential?view=azps-9.3.0#examples
$secret = Add-MgApplicationPassword -applicationId $api_app.Id -PasswordCredential $passwordCred
$secret | Format-List SecretText, EndDateTime

# 3. Build the manifest for the Client App (Swagger). Notice that this has user_impersonation
# access back to the API App
# The Magic Strings are well known Ids
$MSGraphAppId="00000003-0000-0000-c000-000000000000"
$Scope_OpenID="37f7f235-527c-4136-accd-4a02d197296e"
$Scope_OfflineAccess="7427e0e9-2fba-42fe-b0c0-848c9e6a8182"

$client_params = @{
    DisplayName = $AADClientAppName
    Web = @{
        RedirectUris = "http://localhost:8000/api/docs/oauth2-redirect"
    }
    RequiredResourceAccess = @{
        ResourceAppId = $MSGraphAppId
        ResourceAccess = @(
            @{
                Id = $Scope_OpenID
                Type = "Scope"
            },
            @{
                Id = $Scope_OfflineAccess
                Type = "Scope"
            })
        },
        @{
        ResourceAppId = $api_app.AppId
        ResourceAccess = @(
            @{
                Id = $userImpersonationScopeId
                Type = "Scope"
            }
        )
        }
    SignInAudience = "AzureADMyOrg"
}
New-MgApplication @client_params

Disconnect-MgGraph

