#!/bin/bash
set -euo pipefail

mkdir -p ./demo-app/Reports
sudo rm -rf ./demo-app/Reports/*.json
VARS_PATH="./demo-app/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

check_eq "Member0 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member0_demo_pt1.json" $only_status_code)"
addCheckpoint "✅ Member0 successfully ingested data"

check_eq "Member1 - data ingest failed (data is null or empty)" "400" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "" $only_status_code)"
addCheckpoint "✅ Application successfully blocked ingesting empty data"

check_eq "Member1 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member1_demo.json" $only_status_code)"
printf "✅ Member1 successfully ingested data\n"

check_eq "Member2 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member2) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member2_demo.json" $only_status_code)"
addCheckpoint "✅ Member2 successfully ingested data"


curl $reportUrl -X GET $(cert_arg member0) | jq > ../../demo-app/Reports/Member0_Ingest_Data_V1.json
addCheckpoint "✅ Member 0 - read data report"

curl $reportUrl -X GET $(cert_arg member1) | jq > ../../demo-app/Reports/Member1_Ingest_Data_V1.json
printf "✅ Member 1 - read data report\n"

curl $reportUrl -X GET $(cert_arg member2) | jq > ../../demo-app/Reports/Member2_Ingest_Data_V1.json
addCheckpoint "✅ Member 2 - read data report"
