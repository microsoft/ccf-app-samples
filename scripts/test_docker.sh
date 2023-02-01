#!/bin/bash
set -euo pipefail

declare enclave_type=""

declare app_dir=$PWD                   # application folder for reference
declare app_name=${app_dir##*/}        # application name (to be used in container commands)
declare certificate_dir="${app_dir}/workspace/docker_certificates"
declare interactive=0

function usage {
    echo ""
    echo "Start a CCF node in docker and run the tests."
    echo ""
    echo "usage: ./test_docker.sh --serverIP <IPADDRESS> --port <PORT> [--virtual] [--enclave] [--interactive]"
    echo ""
    echo "  --serverIP      string      The IP address of the primary CCF node"
    echo "  --port          string      The port of the primary CCF node"
    echo "  --virtual       string      Run this in a virtual node"
    echo "  --enclave       string      Run this in a SGX node"
    echo "  --interactive   boolean     Optional. Run in Demo mode"
    echo ""
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [ $# -gt 6 ]; then
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
        --interactive) interactive=1;;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z $enclave_type ]; then
    failed "You must supply --virtual or --enclave"
fi
if [ -z "$serverIP" ]; then
    failed "You must supply --serverIP"
fi
if [ -z "$port" ]; then
    failed "You must supply --port"
fi
declare server="https://${serverIP}:${port}"

function finish {
    containerId=$(docker ps -qf ancestor="$app_name:$enclave_type")
    if [ $interactive -eq 1 ]; then
        echo "🤔 Do you want to stop the container (Container ID: ${containerId})? (Y/n)"
        read -r proceed
        if [ "$proceed" == "n" ]; then
            echo "👍 Container will continue to run. Please stop this manually when you are done."
            exit 0
        fi
    fi
    docker stop "$containerId"
    echo "💀 Killed container ${containerId}"
}
trap finish EXIT

docker run --rm --detach --ip "$serverIP" "$app_name:$enclave_type"
containerId=$(docker ps -f ancestor="$app_name:$enclave_type" -q)

echo "💤 Waiting for CCF node to create the certificate..."
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert hence why we use -k
while [ "200" != "$(curl "$server/node/network" -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done

docker cp "$containerId:/app/service_cert.pem" "$certificate_dir"

# Call app-specific setup_governance and test scripts
governanceScript="$app_dir/governance/scripts/setup_governance.sh"
if [ ! -f "$governanceScript" ]; then
    echo "💥📂 Governance file $governanceScript not found."
    exit 1
fi

testScript="$app_dir/test/test.sh"
if [ ! -f "$testScript" ]; then
    echo "💥📂 Test file $testScript not found."
    exit 1
fi

"$governanceScript" --nodeAddress "${serverIP}:${port}" --certificate_dir "$certificate_dir"
if [ $interactive -eq 1 ]; then
    "$testScript" --nodeAddress "${serverIP}:${port}" --certificate_dir "$certificate_dir" --interactive
else
    "$testScript" --nodeAddress "${serverIP}:${port}" --certificate_dir "$certificate_dir"
fi
