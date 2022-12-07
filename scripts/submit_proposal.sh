#!/bin/bash

set -euo pipefail

function usage {
    echo ""
    echo "Submit a ccf proposal and automatically vote with acceptance from submitter ."
    echo ""
    echo "usage: ./submit_proposal.sh --network-url string --proposal-file string --service_cert string --signing-cert string --signing-key string "
    echo ""
    echo "  --network-url   string      ccf network url (example: https://test.confidential-ledger.azure.com)"
    echo "  --proposal-file string      path to any governance proposal to submit (example: dist/set_js_app.json)"
    echo "  --service-cert  string      ccf network certificate file path (example: certs_path/service_cert.pem)"
    echo "  --signing-cert  string      submitter member certificate file path (example: certs_path/member0_cert.pem)"
    echo "  --signing-key   string      submitter member private key file path (example: certs_path/member0_private_key.pem)"
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
        --network_url) network_url="$2"; shift;;
        --proposal_file) proposal_file="$2"; shift;;
        --service_cert) service_cert="$2"; shift;;
        --signing_cert) signing_cert="$2"; shift;;
        --signing_key) signing_key="$2"; shift;;
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [[ -z $network_url ]]; then
    failed "Missing parameter --network-url"
elif [[ -z $proposal_file ]]; then
    failed "Missing parameter --proposal-file"
elif [[ -z $service_cert ]]; then
    failed "Missing parameter --service-cert"
elif [[ -z $signing_cert ]]; then
    failed "Missing parameter --signing-cert"
elif [[ -z $signing_key ]]; then
    failed "Missing parameter --signing-key"
fi

proposal0_out=$(/opt/ccf_virtual/bin/scurl.sh "$network_url/gov/proposals" --cacert $service_cert --signing-key $signing_key --signing-cert $signing_cert --data-binary @$proposal_file -H "content-type: application/json")
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
echo $proposal0_id

app_dir=$PWD  # application folder for reference

/opt/ccf_virtual/bin/scurl.sh "$network_url/gov/proposals/$proposal0_id/ballots" --cacert $service_cert --signing-key $signing_key --signing-cert $signing_cert --data-binary @${app_dir}/governance/vote/vote_accept.json -H "content-type: application/json" | jq

