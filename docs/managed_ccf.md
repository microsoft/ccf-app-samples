# Using Azure Managed CCF

In order to use Azure Managed CCF - you will need to request access to the Private Preview. When your subscription has been given access you will need to login to your subscription and register the provider.

```bash
az provider register --namespace Microsoft.ConfidentialLedger
```

## Registering an existing application with the Azure Resource Manager
If your managed CCF Application is not showing in the portal and you wish to view it in the portal, follow these steps: -

You will need your public certificate that you created your CCF with.

```bash
# Set parameters
subscriptionId=xxxxx
resourceGroup=xxxxx
mccf_instance_name=xxxxx
cert="-----BEGIN CERTIFICATE-----\nMIIByjCCXYZ\n-----END CERTIFICATE-----"

# Create the body
cat <<JSON > body.json
{
  "location": "southcentralus",
  "properties":{
    "deploymentType": {
        "languageRuntime": "JS",
        "appSourceUri": ""
    },
    "memberIdentityCertificates": [ 
      {
          "certificate": "$cert",
          "encryptionkey": ""
      }
    ]      
  }
}
JSON

az rest \
    --method put \
    --uri "https://management.azure.com:443/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ConfidentialLedger/ManagedCCFs/${mccf_instance_name}?api-version=2022-09-08-preview" \
    --body @body.json
```

You should now see your managed CCF app in the portal.