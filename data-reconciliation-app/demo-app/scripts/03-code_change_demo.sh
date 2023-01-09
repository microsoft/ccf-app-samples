#!/bin/bash
set -euo pipefail

VARS_PATH="./demo-app/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

proposal0_out=$(/opt/ccf_virtual/bin/scurl.sh $proposalUrl --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @../../demo-app/set_js_app_v2.json -H "content-type: application/json")
addCheckpoint "✅ Member0 Submitted a new proposal"

proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
/opt/ccf_virtual/bin/scurl.sh "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @../../governance/vote/vote_accept.json -H "content-type: application/json" | jq
addCheckpoint "✅ Member 0 casted a vote in favour of the proposal. Majority vote needed for acceptance"

curl $reportUrl -X GET $(cert_arg member1) | jq > ../../demo-app/Reports/Member1_Code_Change_V1.json
addCheckpoint "✅ Member 1 - Read data report for version1 of the application"

/opt/ccf_virtual/bin/scurl.sh "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member2_privk.pem --signing-cert member2_cert.pem --data-binary @../../governance/vote/vote_accept.json -H "content-type: application/json" | jq
addCheckpoint "✅ Member2 casting a vote in favour of the proposal."

curl $reportUrl -X GET $(cert_arg member1) | jq > ../../demo-app/Reports/Member1_Code_Change_V2.json
addCheckpoint "✅ Member 1 - Read data report for version2 of the application"
