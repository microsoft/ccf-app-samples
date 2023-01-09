#!/bin/bash
set -euo pipefail

VARS_PATH="./demo/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

printf "Member1 submitting a new proposal \n" 
proposal0_out=$(/opt/ccf_virtual/bin/scurl.sh $proposalUrl --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @../../demo/set_js_app_v2.json -H "content-type: application/json")
addCheckpoint "New Proposal Submitted"

proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
printf "Member1 casting a vote in favour of the proposal \n"
/opt/ccf_virtual/bin/scurl.sh "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @../../governance/vote/vote_accept.json -H "content-type: application/json" | jq
addCheckpoint "Majority vote needed for acceptance"

printf "Member2 generating report \n" 
curl $reportUrl -X GET $(cert_arg member1) | jq >> ../../demo/Reports/Member2_Code_Change_V1.json
addCheckpoint "Member 2 - Read data report for version1 of the application \n"


printf "Member3 casting a vote in favour of the proposal \n"
/opt/ccf_virtual/bin/scurl.sh "$proposalUrl/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member2_privk.pem --signing-cert member2_cert.pem --data-binary @../../governance/vote/vote_accept.json -H "content-type: application/json" | jq
addCheckpoint "Proposal got accepted "

printf "Check the status submitted proposal \n"
curl $proposalUrl -k | jq

addCheckpoint "Member2 generating report" 
printf "\n"
curl $reportUrl -X GET $(cert_arg member1) | jq >> ../../demo/Reports/Member2_Code_Change_V2.json
addCheckpoint "Member 2 - Read data report for version2 of the application"
