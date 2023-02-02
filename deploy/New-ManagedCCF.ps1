<#
.Description
This allows you to create a new Managed CCF
 
#> 

[CmdletBinding()]
param(
    # The name of the CCF instance to create
    [Parameter(Mandatory=$true)]
    [string] $CCFName,
    # Resource Group to create CCF in
    [Parameter(Mandatory=$true)]
    [string] $ResourceGroupName,
    # Location of the resource group. Currently only South Central US is supported
    [string] $Location,
    # Filename of the public pem
    [Parameter(Mandatory=$true)]
    [string] $PEMFilename,
    # Tenant of the Service Principal
    [Parameter(Mandatory=$true)]
    [string] $TenantId,
    # Azure Subscription Id
    [Parameter(Mandatory=$true)]
    [string] $SubscriptionId,
    # Credential - You can pass in a Credential object or the ApplicationId
    [Parameter(Mandatory=$false)]
    [ValidateNotNull()]
    [System.Management.Automation.PSCredential]
    [System.Management.Automation.Credential()]
    $Credential = [System.Management.Automation.PSCredential]::Empty
)

if([string]::IsNullOrWhiteSpace($Location)) {
   $Location = "South Central US"
}

# If a credential object is not passed in, request one from the user
if($Credential -eq [System.Management.Automation.PSCredential]::Empty) {
    $Credential = Get-Credential `
        -Message "Enter your Service Principal ApplicationId as the User"
}

if (Test-Path $PEMFilename -PathType leaf) {
    # Read the pem file from disk and convert it to a JSON array
    $memberCert = Get-Content -Path $PEMFilename -Raw
    $jsonArrayOfMembers = @(@{
        cert = $memberCert
        encryptionKey = ""
    })
}
else {
    Throw "PEM File does not exist"
}

# Use the Service Principal to connect to Azure
Connect-AzAccount `
    -ServicePrincipal `
    -SubscriptionId $SubscriptionId `
    -Tenant $TenantId `
    -Credential $Credential

# Create a resource group and then a deployment inside that RG
New-AzResourceGroup -Name $ResourceGroupName -Location $Location -Force
New-AzResourceGroupDeployment -ResourceGroupName $ResourceGroupName `
    -TemplateFile ./bicep/mccf.bicep `
    -resourceName $CCFName `
    -mccfMemberBasedSecurityPrincipals $jsonArrayOfMembers
