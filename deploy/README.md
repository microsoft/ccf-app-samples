# Deploying the CCF Samples

It is possible to deploy these samples to Azure Managed CCF. The following instructions will guide you through the process.

## Prerequisites

- You will need to have an Azure subscription with access to the Private Preview of Azure Managed CCF. If you do not have access to the Private Preview, please contact the CCF team to request access.
- You will need to have the Azure CLI installed. You can find instructions on how to install the Azure CLI [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
- The following az commands will need to be run to register the provider and the feature. You will need to be logged in to your subscription.

```bash
az feature registration create --namespace Microsoft.ConfidentialLedger --name ManagedCCF

az provider register --namespace Microsoft.ConfidentialLedger
```

If you receive any errors when running the above commands, it may be that your subscription has not been given access to the Private Preview. Please contact the CCF team to request access.

## Deploying an Azure Managed CCF instance using PowerShell

The files in this directory will help you deploy an Azure Managed CCF instance from the command line. You can also create an instance from the portal. Both ARM and Bicep are supplied here, but this guide shows the Bicep deployment.

At its simplest, you need 3 things to create an Azure Managed CCF instance:

- a Service Principal, follow [here](https://learn.microsoft.com/en-us/powershell/azure/create-azure-service-principal-azureps?view=azps-9.3.0#create-a-service-principal) for further information 
- a name for your CCF instance
- the certificate for the initial member

!!! Note
The following commands assume you have created some pem files and they are in the deploy folder. Please see [here](https://microsoft.github.io/CCF/main/governance/adding_member.html#generating-member-keys-and-certificates) for instructions on how to generate these files.

This devcontainer has PowerShell installed with the minimum required to deploy to Azure.

```pwsh
cd deploy
./New-ManagedCCF.ps1 -CCFName myCCF4 `
    -resourcegroupName test `
    -tenantid myTenantId `
    -subscriptionid MySubscriptionId `
    -pemfilename member0_cert.pem `
    -Credential myApplicationId
```

Alternatively you could run the following command and enter the correct values.
```bash
make deploy-mccf
```

## Deploying an Azure Managed CCF instance using Azure CLI

The files in this directory will help you deploy an Azure Managed CCF instance from the command line. You can also create an instance from the portal. Both ARM and Bicep are supplied here, but this guide shows the Bicep deployment.

At its simplest, you need 2 things to create an Azure Managed CCF instance:

- its name
- the certificate for the initial member

!!! Note
The following commands assume you have created some pem files and they are in the deploy folder. Please see [here](https://microsoft.github.io/CCF/main/governance/adding_member.html#generating-member-keys-and-certificates) for instructions on how to generate these files.

```bash
cd deploy

# Create a json array of members in the correct format with the certificate
certFile="member0_cert.pem"
certAsJSONCompatibleString=$(< $certFile sed '$!G' | paste -sd '\\n' -)
jsonArrayOfMembers="[{\"cert\":\"$certAsJSONCompatibleString\", \"encryptionKey\":\"\"}]"

az group create -n myResourceGroup -l southcentralus

az deployment group create \
    --resource-group myResourceGroup \
    --template-file bicep/mccf.bicep \
    --parameters resourceName=myccf \
        mccfMemberBasedSecurityPrincipals="$jsonArrayOfMembers"
```

## Deploying a CCF application to Azure Managed CCF

Deploying a CCF application to Azure Managed CCF is very similar to deploying a CCF application to a local CCF instance. You can deploy any of the samples in this repository to Azure Managed CCF. The following commands will execute the same commands that are run in our Continuous Deployment.

!!! Note
The following commands assume you have created some pem files.

```bash
export CCF_NAME=myccf
export PUBLIC_CERT=$(< member0_cert.pem sed '$!G' | paste -sd '\\n' -)
export PRIVATE_CERT=$(< member0_privk.pem sed '$!G' | paste -sd '\\n' -)

cd <sample_path>
make test-mccf
```
