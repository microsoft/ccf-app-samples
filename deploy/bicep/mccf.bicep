@description('Resource Name')
param resourceName string

@description('Azure Region')
param location string = 'southcentralus'

@description('MCCF App type')
param mccfAppSourceUri string = 'ThisMustHaveAValue'

@description('MCCF Language Runtime')
@allowed([
  'JS'
  'CPP'
])
param mccfAppLanguage string = 'JS'

@description('Member identities')
param mccfMemberBasedSecurityPrincipals array

var memberBasedSecurityPrincipals = [for i in range(0, length(mccfMemberBasedSecurityPrincipals)): {
  certificate: last(take(mccfMemberBasedSecurityPrincipals, (i + 1))).cert
  encryptionkey: last(take(mccfMemberBasedSecurityPrincipals, (i + 1))).encryptionKey
}]

resource resourceName_resource 'Microsoft.ConfidentialLedger/ManagedCCFs@2022-09-08-preview' = {
  name: resourceName
  location: location
  properties: {
    deploymentType: {
      languageRuntime: mccfAppLanguage
      appSourceUri: mccfAppSourceUri
    }
    memberIdentityCertificates: memberBasedSecurityPrincipals
  }
}
