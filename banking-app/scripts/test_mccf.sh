#!/bin/bash
set -euo pipefail

declare certificate_dir="./workspace/mccf_certificates"

function usage {
    echo ""
    echo "Start a CCF node in mCCF."
    echo ""
    echo "usage: ./test_mccf.sh --address <ADDRESS>"
    echo ""
    echo "  --address  string      The address of the primary CCF node"
    echo ""
    exit 0
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [ $# -gt 2 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --address) address="$2"; shift;;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z $address ]; then
    failed "You must supply --address"
fi
server="https://${address}"

echo "💤 Get the Service cert.."
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert hence why we use -k
while [ "200" != "$(curl $server/node/network -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done

mkdir -p ${certificate_dir}
certAsString=$(curl $server/node/network -k | jq -r .service_certificate)

# Convert string with \n into file with new lines
echo -e "$certAsString" > "${certificate_dir}/service_cert.pem"

./scripts/setup_governance.sh --nodeAddress ${address} --certificate_dir "$certificate_dir"
./scripts/test.sh --nodeAddress ${address} --certificate_dir "$certificate_dir"
