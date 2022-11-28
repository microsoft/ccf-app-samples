#!/bin/bash
set -euo pipefail

declare enclave_type=""

function usage {
    echo ""
    echo "Test this sample running in docker."
    echo ""
    echo "usage: ./stop_docker.sh [--virtual] [--enclave]"
    echo ""
    echo "  --virtual   string      Run this in a virtual node"
    echo "  --enclave   string      Run this in a SGX node"
    echo ""
    exit 0
}

function failed {
    printf "Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [[ $# -eq 0 || $# -gt 1 ]]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --virtual) enclave_type="virtual";;
        --enclave) enclave_type="enclave";;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z $enclave_type ]; then
    failed "You must supply --virtual or --enclave"
fi

containerId=$(docker ps -qf ancestor=banking-app:$enclave_type)
echo "Stopping docker instance: "
docker stop $containerId
