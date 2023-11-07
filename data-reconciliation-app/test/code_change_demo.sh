#!/bin/bash
set -euo pipefail

declare certificate_dir="./workspace/mccf_certificates"
declare interactive=0

function usage {
    echo ""
    echo "Open a network in mCCF and then run the tests."
    echo ""
    echo "usage: ./code_change_demo.sh --address <ADDRESS>"
    echo ""
    echo "  --address       string      The address of the primary CCF node"
    echo "  --interactive   boolean     Optional. Run in Demo mode"
    echo ""
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

function addCheckpoint {
    if [ $interactive -eq 1 ]; then
        printf "%s\n\n" "${1}"
        read -n1 -r -p "- Press any key to continue..."
        printf "\n"
    fi
}

cert_arg() {
    caller="$1"
    echo "--cacert service_cert.pem --cert ${caller}_cert.pem --key ${caller}_privk.pem"
}

# parse parameters

if [ $# -gt 3 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    case "$1" in
        --address) address="$2"; shift 2;;
        --interactive) interactive=1; shift;;
        --help) usage; exit 0;;
        *) usage; exit 1;;
    esac
done

# validate parameters
if [ -z "$address" ]; then
    failed "You must supply --address"
fi
server="https://${address}"

# Set up Python package
if [ ! -f "env/bin/activate" ]
    then
        python3.8 -m venv env
fi
source env/bin/activate
pip install -q ccf==$(cat /opt/ccf_virtual/share/VERSION)

reportUrl="$server/app/report"
proposalUrl="$server/gov/proposals"
id="9845001D460PEJE54159"

cd "${certificate_dir}"

addCheckpoint "💤Checking nodes at ${server}/node/network/nodes"
curl "${server}/node/network/nodes" --cacert service_cert.pem --no-progress-meter | jq
addCheckpoint "🎬 Managed CCF is Kubernetes!"

echo "💤Submitting new application to the network"
proposal0_out=$(ccf_cose_sign1 --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` --signing-key member0_privk.pem --signing-cert member0_cert.pem --content $../../dist/set_js_app.json | curl -s "$network_url/gov/proposals" --cacert service_cert.pem --data-binary @- -H "content-type: application/cose")
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
ccf_cose_sign1 --ccf-gov-msg-type ballot --ccf-gov-msg-proposal_id $proposal0_id --ccf-gov-msg-created_at `date -uIs` --signing-key member0_privk.pem --signing-cert member0_cert.pem --content ../../governance/vote/vote_accept.json | curl -s "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --data-binary @- -H "content-type: application/cose" | jq
addCheckpoint "🎬 Member 0 Submitted a proposal and voted in favour of the proposal. Majority vote needed for acceptance"

printf "💤Get reconciliation report for member 1\n"
#curl $reportUrl -X GET $(cert_arg member1) | jq > ../../demo-app/Reports/Member1_Code_Change_V1.json
curl $reportUrl/$id -X GET $(cert_arg member1) --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 Existing reconciliation summary for member 1"

printf "\n💤Member 2 will accept the new application\n"
ccf_cose_sign1 --ccf-gov-msg-type ballot --ccf-gov-msg-proposal_id $proposal0_id --ccf-gov-msg-created_at `date -uIs` --signing-key member2_privk.pem --signing-cert member2_cert.pem --content ../../governance/vote/vote_accept.json | curl -s "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --data-binary @- -H "content-type: application/cose" | jq
addCheckpoint "🎬 Member2 casting a vote in favour of the proposal."

printf "\n💤Get reconciliation report for member 1 again\n"
curl $reportUrl/$id -X GET $(cert_arg member1) --no-progress-meter | jq '. | {content}'
echo "🏁 New reconciliation summary for member 1"
