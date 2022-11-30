#!/bin/bash
set -euo pipefail

function usage {
    echo ""
    echo "Create a new HSM-based key-vault in an Azure subscription."
    echo ""
    echo "usage: ./create_keyvault.sh --vault-name string --resource-group string --location string "
    echo ""
    echo "  --vault-name string       a unique key-vault name (example: kv-test)"
    echo "  --resource-group string   resource-group name when key-vault (example: rg-test)"
    echo "  --location                key-vault data center location (example: westeurope)"
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
        --resource_group) resource_group="$2"; shift;;
        --location) location="$2"; shift;;
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z "$vault_name" ]; then
	failed "Missing parameter --vault-name"
elif [ -z "$resource_group" ]; then
	failed "Missing parameter --resource-group"
elif [ -z "$location" ]; then
	failed "Missing parameter --location"
fi

kv_already_exists=$(az keyvault show --name $vault_name --resource-group $resource_group --query name -o tsv 2>/dev/null || true)
if [ -z "$kv_already_exists" ]; then
    echo "Creating key vault $vault_name..."
    # Notice the --sku parameter to enable HSM-backed keys
    az keyvault create --name $vault_name --resource-group $resource_group --location $location  --sku "Premium"
else
    echo "Key vault $vault_name already exists."
fi