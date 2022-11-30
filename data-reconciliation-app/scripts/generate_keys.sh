#!/bin/bash
set -euo pipefail

function usage {
    echo ""
    echo "Generate a new certificate, private key, and encryption public key in an azure key-vault for user or member"
    echo ""
    echo "usage: ./generate_keys.sh --vault-name string --cert-name string "
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

cert_already_exists=$(az keyvault certificate show --vault-name $vault_name --name $IDENTITY_CERT_NAME --query id -o tsv 2>/dev/null || true)
if [ -z "$cert_already_exists" ]; then
    echo "Creating certificate $IDENTITY_CERT_NAME..."
    az keyvault certificate create --vault-name $vault_name --name $IDENTITY_CERT_NAME --policy @identity_cert_policy.json
else
    echo "Certificate $IDENTITY_CERT_NAME already exists."
fi

encryption_key_exists=$(az keyvault key show --vault-name $vault_name --name $ENCRYPTION_KEY_NAME --query key.kid -o tsv 2>/dev/null || true)
if [ -z "$encryption_key_exists" ]; then
    echo "Creating encryption key $ENCRYPTION_KEY_NAME..."
    az keyvault key create --vault-name $vault_name --name $ENCRYPTION_KEY_NAME --kty RSA --ops decrypt
else
    echo "Encryption key $ENCRYPTION_KEY_NAME already exists."
fi