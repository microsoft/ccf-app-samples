#!/bin/bash
set -euo pipefail

function usage {
    echo ""
    echo "Retrieve the certificate and enc-keys from an azure key-vault"
    echo ""
    echo "usage: ./retrieve_keys.sh --vault-name string --cert-name string "
    echo ""
    echo "  --vault-name string       the key-vault name which will create certs on (example: kv-test)"
    echo "  --cert-name string        certificate unique name (example: member1)"
    echo ""
    exit 0
}

function failed {
    printf "Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --vault_name) vault_name="$2"; shift;;
        --cert_name) cert_name="$2"; shift;;
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z "$vault_name" ]; then
	failed "Missing parameter --vault-name"
elif [ -z "$cert_name" ]; then
	failed "Missing parameter --cert-name"
fi

IDENTITY_CERT_NAME="$cert_name"
ENCRYPTION_KEY_NAME="$cert_name-enc"

# Downloads PEM identity certificate
az keyvault certificate download --file ${IDENTITY_CERT_NAME}_cert.pem --vault-name $vault_name --name $IDENTITY_CERT_NAME

# Downloads PEM encryption public key
az keyvault key download --file ${ENCRYPTION_KEY_NAME}_pubk.pem --vault-name $vault_name --name $ENCRYPTION_KEY_NAME


# We must not download the private keys on the production environment, 
# we can follow https://microsoft.github.io/CCF/main/governance/hsm_keys.html#http-request-signature
# Download the secret (private key) of the certificate - it will be a pfx file
encoded_data=$(az keyvault secret show --vault-name $vault_name --name $IDENTITY_CERT_NAME | jq .value -r)
echo $encoded_data | base64 -d > ${IDENTITY_CERT_NAME}_privk.pfx

# Convert the pfx file into pem format
openssl pkcs12 -in ${IDENTITY_CERT_NAME}_privk.pfx -out ${IDENTITY_CERT_NAME}_privk.pem -nodes -password pass: