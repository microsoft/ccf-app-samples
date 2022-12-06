#!/bin/bash
set -euo pipefail

declare app_dir=$PWD                   # application folder for reference
declare app_name=${app_dir##*/}        # application name (to be used in container commands)
declare certificate_dir="${app_dir}/workspace/mccf_certificates"

function usage {
    echo ""
    echo "Open a network in mCCF and then run the tests."
    echo ""
    echo "usage: ./test_mccf.sh --address <ADDRESS> --signing-cert <CERT> --signing-key <CERT>"
    echo ""
    echo "  --address       string      The address of the primary CCF node"
    echo "  --signing-cert  string      The signing certificate (member0)"
    echo "  --signing-key   string      The signing key (member0)"
    echo ""
    exit 0
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
        --address) address="$2"; shift;;
        --signing-cert) signing-cert="$2"; shift;;
        --signing-key) signing-key="$2"; shift;;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z ${signing-cert} ]; then
    failed "You must supply --signing-cert"
fi
if [ -z ${signing-key} ]; then
    failed "You must supply --signing-key"
fi
if [ -z $address ]; then
    failed "You must supply --address"
fi
server="https://${address}"

echo "💤 Getting the Service cert from $server"
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert hence why we use -k
while [ "200" != "$(curl $server/node/network -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done
echo "🎉 Got the Service certificate"

mkdir -p ${certificate_dir}
certAsString=$(curl $server/node/network -k | jq -r .service_certificate)

# Convert string with \n into file with new lines
echo -e "${certAsString}" > "${certificate_dir}/service_cert.pem"
echo -e ${signing-cert} > "${certificate_dir}/member0_cert.pem"
echo -e ${signing-key} > "${certificate_dir}/member0_privk.pem"

$app_dir/governance/scripts/setup_governance.sh --nodeAddress ${address} --certificate_dir "$certificate_dir"
$app_dir/test/test.sh --nodeAddress ${address} --certificate_dir "$certificate_dir"
