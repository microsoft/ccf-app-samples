#!/bin/bash
set -euo pipefail

VARS_PATH="./demo-app/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

check_eq "Member0 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member0_demo_pt2.json" $only_status_code)"
addCheckpoint "✅ Member0 successfully ingested additional data"

curl $reportUrl -X GET $(cert_arg member0) |jq > ../../demo-app/Reports/Member1_Report_Change_V1.json
addCheckpoint "✅ Member 0 - read data report"


curl $reportUrl -X GET $(cert_arg member1) | jq > ../../demo-app/Reports/Member1_Report_Change_V1.json
addCheckpoint "✅ Data report changes for Member1"

curl $reportUrl -X GET $(cert_arg member2) | jq > ../../demo-app/Reports/Member2_Report_Change_V1.json
addCheckpoint "✅ Data report changes for Member2"
