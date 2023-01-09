#!/bin/bash
set -euo pipefail

VARS_PATH="./demo/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

printf "Member1 trying to ingest additional data \n" 
check_eq "Member1 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../demo/data/member1_demo_pt2.json" $only_status_code)"
addCheckpoint "✅ Member1 successfully ingested additional data"

curl $reportUrl -X GET $(cert_arg member0) |jq >> ../../demo/Reports/Member1_Report_Change_V1.json
addCheckpoint "✅ Member 0 - read data report"


curl $reportUrl -X GET $(cert_arg member1) | jq >> ../../demo/Reports/Member2_Report_Change_V1.json
addCheckpoint "✅ Data report changes for Member2"

curl $reportUrl -X GET $(cert_arg member2) | jq >> ../../demo/Reports/Member3_Report_Change_V1.json
addCheckpoint "✅ Data report changes for Member3"
