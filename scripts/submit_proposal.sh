#!/bin/bash

set -euo pipefail

function usage {
    echo ""
    echo "Submit a ccf proposal and automatically vote with acceptance."
    echo ""
    echo "usage: ./submit_proposal.sh --network-url string --certificate-dir <workspace/sandbox_common> string --proposal-file string --member-count number"
    echo ""
    echo "  --network-url           string      ccf network url (example: https://test.confidential-ledger.azure.com)"
    echo "  --certificate-dir       string      The directory where the certificates are"
    echo "  --proposal-file         string      path to any governance proposal to submit (example: dist/set_js_app.json)"
    echo "  --member-count          number      number of network members need to approve the proposal"
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

member_count=1

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --network_url) network_url="$2"; shift;;
        --certificate_dir) certificate_dir="$2"; shift;;
        --proposal_file) proposal_file="$2"; shift;;
        --member_count) member_count=$2; shift;;
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [[ -z $network_url ]]; then
    failed "Missing parameter --network-url"
elif [[ -z $certificate_dir ]]; then
   failed "You must supply --certificate-dir"
elif [[ -z $proposal_file ]]; then
    failed "Missing parameter --proposal-file"
fi

app_dir=$PWD  # application folder for reference
service_cert="$certificate_dir/service_cert.pem"
signing_cert="$certificate_dir/member0_cert.pem"
signing_key="$certificate_dir/member0_privk.pem"

if [ ! -f "env/bin/activate" ]
    then
        python3.8 -m venv env
fi
source env/bin/activate
pip install -q ccf==$(cat /opt/ccf_virtual/share/VERSION)

proposal0_out=$(ccf_cose_sign1 --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` --signing-key $signing_key --signing-cert $signing_cert --content $proposal_file | curl -s "$network_url/gov/proposals" --cacert $service_cert --data-binary @- -H "content-type: application/cose")
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
echo $proposal0_id

# proposal submitter vote for proposal
ccf_cose_sign1 --ccf-gov-msg-type ballot --ccf-gov-msg-proposal_id $proposal0_id --ccf-gov-msg-created_at `date -uIs` --signing-key $signing_key --signing-cert $signing_cert --content ${app_dir}/governance/vote/vote_accept.json | curl -s "$network_url/gov/proposals/$proposal0_id/ballots" --cacert $service_cert --data-binary @- -H "content-type: application/cose" | jq

for ((i = 1 ; i < $member_count ; i++)); do
  signing_cert="$certificate_dir/member${i}_cert.pem"
  signing_key="$certificate_dir/member${i}_privk.pem"
  ccf_cose_sign1 --ccf-gov-msg-type ballot --ccf-gov-msg-proposal_id $proposal0_id --ccf-gov-msg-created_at `date -uIs` --signing-key $signing_key --signing-cert $signing_cert --content ${app_dir}/governance/vote/vote_accept.json | curl -s "$network_url/gov/proposals/$proposal0_id/ballots" --cacert $service_cert --data-binary @- -H "content-type: application/cose" | jq
done
