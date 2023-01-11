#!/bin/bash
set -euo pipefail

declare certificate_dir="./workspace/mccf_certificates"
declare server="https://fsdemo.confidential-ledger.azure.com"

# shellcheck disable=SC1091
. "./demo-app/scripts/env_vars.sh"

cd "${certificate_dir}"

addCheckpoint "💤Checking nodes at ${server}/node/network/nodes"
curl "${server}/node/network/nodes" --cacert service_cert.pem --no-progress-meter | jq
addCheckpoint "🎬 Managed CCF is Kubernetes!"

echo "💤Submitting new application to the network"
proposal0_out=$(/opt/ccf_virtual/bin/scurl.sh "$proposalUrl" --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @../../dist/set_js_app.json -H "content-type: application/json" --no-progress-meter)
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
/opt/ccf_virtual/bin/scurl.sh "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @../../governance/vote/vote_accept.json -H "content-type: application/json" --no-progress-meter | jq
addCheckpoint "🎬 Member 0 Submitted a proposal and voted in favour of the proposal. Majority vote needed for acceptance"

printf "💤Get reconciliation report for member 1\n"
#curl $reportUrl -X GET $(cert_arg member1) | jq > ../../demo-app/Reports/Member1_Code_Change_V1.json
curl $reportUrl/$id -X GET $(cert_arg member1) --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 Existing reconciliation summary for member 1"

printf "\n💤Member 2 will accept the new application\n"
/opt/ccf_virtual/bin/scurl.sh "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member2_privk.pem --signing-cert member2_cert.pem --data-binary @../../governance/vote/vote_accept.json -H "content-type: application/json" --no-progress-meter | jq
addCheckpoint "🎬 Member2 casting a vote in favour of the proposal."

printf "\n💤Get reconciliation report for member 1 again\n"
curl $reportUrl/$id -X GET $(cert_arg member1) --no-progress-meter | jq '. | {content}'
echo "🏁 New reconciliation summary for member 1"
