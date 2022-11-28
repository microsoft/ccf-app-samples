#!/bin/bash
set -euo pipefail

declare enclave_type=""

function usage {
    echo ""
    echo "Start a CCF node docker in docker."
    echo ""
    echo "usage: ./start_docker.sh --serverIP <IPADDRESS> [--virtual] [--enclave]"
    echo ""
    echo "  --serverIP  string      The IP address of the primary CCF node"
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

if [[ $# -lt 3 || $# -gt 3 ]]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --serverIP) serverIP="$2"; shift;;
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
if [ -z $serverIP ]; then
    failed "You must supply --serverIP"
fi

docker run --detach --ip $serverIP banking-app:$enclave_type
containerId=$(docker ps -f ancestor=banking-app:$enclave_type -q)
# Wait for container to generate the cert
echo "Waiting for docker to startup . . ."
sleep 5
docker cp "$containerId:/app/service_cert.pem" ./workspace/docker_certificates
