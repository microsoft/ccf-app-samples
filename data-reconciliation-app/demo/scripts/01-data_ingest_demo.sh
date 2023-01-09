#!/bin/bash
set -euo pipefail

sudo rm -rf ./demo/Reports/*.json
VARS_PATH="./demo/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

printf "Member1 trying to ingest data \n" 
check_eq "Member1 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../demo/data/member1_demo_pt1.json" $only_status_code)"
addCheckpoint "✅ Member1 successfully ingested data"

# printf "Member2 trying to ingest empty data \n"
check_eq "Member2 - data ingest failed (data is null or empty)" "400" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "" $only_status_code)"
addCheckpoint "❌ Member2 failed to ingest empty data"

# printf "Member2 trying to ingest data \n" 
check_eq "Member2 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "@../../demo/data/member2_demo.json" $only_status_code)"
printf "\n✅ Member2 successfully ingested data\n"

# printf "Member3 trying to ingest data \n" 
check_eq "Member3 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member2) -H "Content-Type: application/json" --data-binary "@../../demo/data/member3_demo.json" $only_status_code)"
addCheckpoint "✅ Member3 successfully ingested data"


curl $reportUrl -X GET $(cert_arg member0) |jq >> ../../demo/Reports/Member1_Ingest_Data_V1.json
addCheckpoint "✅ Member 1 - read data report"

curl $reportUrl -X GET $(cert_arg member1) | jq >> ../../demo/Reports/Member2_Ingest_Data_V1.json
printf "✅ Member 2 - read data report\n\n"

curl $reportUrl -X GET $(cert_arg member2) | jq >> ../../demo/Reports/Member3_Ingest_Data_V1.json
addCheckpoint "✅ Member 3 - read data report"
