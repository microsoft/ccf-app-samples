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

## Deploying an Azure Managed CCF instance

The files in this directory will help you deploy an Azure Managed CCF instance from the command line. You can also create an instance from the portal. Both ARM and Bicep are supplied here, but this guide shows the Bicep deployment.

At it's simplest, you need 2 things to create an Azure Managed CCF instance:

- it's name
- the certificate for the initial member

!!! Note
The following commands assume you have created some pem files and they are in the deploy folder.

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
