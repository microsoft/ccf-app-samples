#!/bin/bash
set -euo pipefail

declare enclave_type=""

declare app_dir=$PWD                   # application folder for reference
declare app_name=${app_dir##*/}        # application name (to be used in container commands)
declare certificate_dir="${app_dir}/workspace/docker_certificates"

function usage {
    echo ""
    echo "Start a CCF node in docker."
    echo ""
    echo "usage: ./test_docker.sh --serverIP <IPADDRESS> --port <PORT> [--virtual] [--enclave]"
    echo ""
    echo "  --serverIP  string      The IP address of the primary CCF node"
    echo "  --port      string      The port of the primary CCF node"
    echo "  --virtual   string      Run this in a virtual node"
    echo "  --enclave   string      Run this in a SGX node"
    echo ""
    exit 0
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [ $# -gt 5 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --serverIP) serverIP="$2"; shift;;
        --port) port="$2"; shift;;
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
if [ -z $port ]; then
    failed "You must supply --port"
fi
declare server="https://${serverIP}:${port}"

function finish {
    containerId=$(docker ps -qf ancestor=$app_name:$enclave_type)
    docker stop $containerId
    echo "💀 Killed container ${containerId}"
}
trap finish EXIT

docker run --detach --ip $serverIP $app_name:$enclave_type
containerId=$(docker ps -f ancestor=$app_name:$enclave_type -q)

echo "💤 Waiting for CCF node to create the certificate..."
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert hence why we use -k
while [ "200" != "$(curl $server/node/network -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done

docker cp "$containerId:/app/service_cert.pem" "$certificate_dir"

# Call app-specific setup_governance and test scripts
check_existence=$(ls $app_dir/governance/scripts/setup_governance.sh 2>/dev/null || true)
if [ -z "$check_existence" ]; then
    failed "You are missing a setup_governance script in your application"
    exit 0
fi

check_existence=$(ls $app_dir/test/test.sh 2>/dev/null || true)
if [ -z "$check_existence" ]; then
    failed "You are missing a test.sh script in your application."
    exit 0
fi

$app_dir/governance/scripts/setup_governance.sh --nodeAddress ${serverIP}:${port} --certificate_dir "$certificate_dir"
$app_dir/test/test.sh --nodeAddress ${serverIP}:${port} --certificate_dir "$certificate_dir"
