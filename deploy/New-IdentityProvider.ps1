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
    # Tenant where the Application Registrations are
    [Parameter(Mandatory=$true)]
    [string] $TenantId
)

# The Magic Strings are well known Ids
$MSGraphAppId="00000003-0000-0000-c000-000000000000"
# $Scope_OpenID="37f7f235-527c-4136-accd-4a02d197296e"
# $Scope_OfflineAccess="7427e0e9-2fba-42fe-b0c0-848c9e6a8182"
$Scope_UserRead="e1fe6dd8-ba31-4d61-89e7-88639da4683d"

# Hold all of our keys in a hashtable
$output = @{}
# Clean our .env file
Remove-Item ../.env -Force -ErrorAction SilentlyContinue

# Connect with the correct scopes that you need to perform the management operations.
# These are not the scopes you are granting to the applications.
$RequiredScopes = @("Directory.AccessAsUser.All", "Directory.ReadWrite.All", "Application.ReadWrite.All")
Connect-MgGraph -TenantId $TenantId -Scopes $RequiredScopes

# 1. Create the application that secures the API.
# https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplication?view=graph-powershell-1.0
#$userImpersonationScopeId=New-Guid
$api_app_manifest = @{
    DisplayName = $AADApiAppName
    SignInAudience = "AzureADMyOrg"
    RequiredResourceAccess = @{
        ResourceAppId = $MSGraphAppId
        ResourceAccess = @(
            @{
                Id = $Scope_UserRead
                Type = "Scope"
            })
        }
}
$api_app = New-MgApplication @api_app_manifest
$output.Add("ApiApplicationId", $api_app.AppId)
$output.Add("ApiIdentifierUri", "api://$($api_app.AppId)")

# This application needs an Application ID URI so we can uniquely reference its Scopes
Update-MgApplication -ApplicationId $api_app.Id -IdentifierUris @($output["ApiIdentifierUri"])

# 2. Build the manifest for the Client App (Swagger).
$client_params = @{
    DisplayName = $AADClientAppName
    RequiredResourceAccess = @{
        ResourceAppId = $MSGraphAppId
        ResourceAccess = @(
            @{
                Id = $Scope_UserRead
                Type = "Scope"
            })
        }
    SignInAudience = "AzureADMyOrg"
}
$client_app = New-MgApplication @client_params
$output.Add("ClientApplicationId", $client_app.AppId)

# 2. Now add a password and it will be returned to you, only the first time around.
$passwordCred = @{
   displayName = 'Created in PowerShell'
   endDateTime = (Get-Date).AddMonths(6)
}

# https://learn.microsoft.com/en-us/powershell/module/az.resources/new-azadappcredential?view=azps-9.3.0#examples
$secret = Add-MgApplicationPassword -applicationId $client_app.Id -PasswordCredential $passwordCred
$output.Add("ClientSecret", $secret.SecretText)

# Output hastable as key=value pairs in a file
$output.GetEnumerator() | ForEach-Object {
    Add-Content ../.env "$($_.Key)=$($_.Value)"
}

# Destroy any cookies/connections
Disconnect-MgGraph
