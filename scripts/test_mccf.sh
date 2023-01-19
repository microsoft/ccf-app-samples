#!/bin/bash
set -euo pipefail

declare app_dir=$PWD                   # application folder for reference
declare certificate_dir="${app_dir}/workspace/mccf_certificates"
declare signing_cert=""
declare signing_key=""

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
    case "$1" in
        --address) address="$2"; shift 2;;
        --signing-cert) signing_cert="$2"; shift 2;;
        --signing-key) signing_key="$2"; shift 2;;
        --help) usage; exit 0;;
        *) usage; exit 1;;
    esac
done

# validate parameters
if [ -z "${signing_cert}" ]; then
    failed "You must supply --signing-cert"
fi
if [ -z "${signing_key}" ]; then
    failed "You must supply --signing-key"
fi
if [ -z "$address" ]; then
    failed "You must supply --address"
fi
server="https://${address}"

echo "💤 Getting the Service cert from $server"
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert hence why we use -k
while [ "200" != "$(curl "$server/node/network" -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done
echo "🎉 Got the Service certificate"

mkdir -p "${certificate_dir}"
certAsString=$(curl "$server/node/network" -k | jq -r .service_certificate)

# Convert string with \n into file with new lines
echo -e "${certAsString}" > "${certificate_dir}/service_cert.pem"
echo -e "${signing_cert}" > "${certificate_dir}/member0_cert.pem"
echo -e "${signing_key}" > "${certificate_dir}/member0_privk.pem"
"$app_dir/governance/scripts/setup_governance.sh" --nodeAddress "${address}" --certificate_dir "$certificate_dir"
"$app_dir/test/test.sh" --nodeAddress "${address}" --certificate_dir "$certificate_dir"
