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
$ScopeUserRead="e1fe6dd8-ba31-4d61-89e7-88639da4683d"
$userImpersonationScopeId=New-Guid

# 1. Build a hashtable for all the things we want to output
# into an .env for other scripts to use.
$Output = @{}
$Output.Add("TenantId", $TenantId)
# Clean our .env file
Remove-Item ../aad.env -Force -ErrorAction SilentlyContinue

# 2. Connect with the correct scopes that you need to perform the management
# operations. These are not the scopes you are granting to the applications.
$RequiredScopes = @("Directory.AccessAsUser.All", "Directory.ReadWrite.All", "Application.ReadWrite.All")
Connect-MgGraph -TenantId $TenantId -Scopes $RequiredScopes

# 3. Create the application that secures the API.
# https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplication?view=graph-powershell-1.0
$APIAppManifest = @{
    DisplayName = $AADApiAppName
    SignInAudience = "AzureADMyOrg"
    RequiredResourceAccess = @{
        ResourceAppId = $MSGraphAppId
        ResourceAccess = @(
            @{
                Id = $ScopeUserRead
                Type = "Scope"
            })
        }
}
$APIApp = New-MgApplication @APIAppManifest
$Output.Add("ApiApplicationId", $APIApp.AppId)
$Output.Add("ApiIdentifierUri", "api://$($APIApp.AppId)")

# Add a Service Principal to the API Application 
$APIServicePrincipalManifest=@{
  AppId = $APIApp.AppId
  AccountEnabled = true
}
$APIServicePrincipal = New-MgServicePrincipal -BodyParameter $APIServicePrincipalManifest

$oauth2PermissionScopes = @{
    oauth2PermissionScopes =@(
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

# This application needs an Application ID URI so we can uniquely reference its Scopes.
# The portal does this for us and uses the Id of the App that we have just created.
# This could be api://MyUniqueDomain if we wanted.
Update-MgApplication -ApplicationId $APIApp.Id -IdentifierUris @($Output["ApiIdentifierUri"]) -Api $oauth2PermissionScopes

# 4. Build the manifest for the Client App (Swagger).
$ClientAppManifest = @{
    DisplayName = $AADClientAppName
    RequiredResourceAccess = @{
        ResourceAppId = $MSGraphAppId
        ResourceAccess = @(
            @{
                Id = $ScopeUserRead
                Type = "Scope"
            })
        }
    SignInAudience = "AzureADMyOrg"
    Spa = @{
        RedirectUris = "https://127.0.0.1:8000/app/oauth2-redirect.html"
    }
    Web = @{
        ImplicitGrantSettings = @{
            EnableAccessTokenIssuance= $true
        }
    }
}
$ClientApp = New-MgApplication @ClientAppManifest
$Output.Add("ClientApplicationId", $ClientApp.AppId)

# 5. Add a Service Principal to the Client (Swagger) Application which
# will allow us to login in as it
$ServicePrincipalManifest=@{
  AppId = $ClientApp.AppId
  AccountEnabled = true
}
$ServicePrincipal = New-MgServicePrincipal -BodyParameter $ServicePrincipalManifest

# 6. Now add a password and it will be returned to you, only the first time around.
$PasswordCredentials = @{
    PasswordCredential = @{
        DisplayName = "Created via PowerShell"
    }
}
# https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/add-mgserviceprincipalpassword?view=graph-powershell-1.0
$SPNPassword = Add-MgServicePrincipalPassword -ServicePrincipalId $ServicePrincipal.Id -BodyParameter $PasswordCredentials
$Output.Add("ClientSecret", $SPNPassword.SecretText)

# 7. Output hastable as key=value pairs in a file
$Output.GetEnumerator() | ForEach-Object {
    Add-Content ../aad.env "$($_.Key)=$($_.Value)"
}

# 8. Destroy any cookies/connections
Disconnect-MgGraph
