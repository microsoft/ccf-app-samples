#!/bin/bash
set -euo pipefail

mkdir -p ./demo-app/Reports
sudo rm -rf ./demo-app/Reports/*.json
VARS_PATH="./demo-app/scripts/env_vars.sh"
. "$VARS_PATH"

cd "${certs}"

check_eq "Member0 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member0_demo_pt1.json" $only_status_code)"

check_eq "Member1 - data ingest failed (data is null or empty)" "400" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "" $only_status_code)"

check_eq "Member1 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member1_demo.json" $only_status_code)"

check_eq "Member2 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member2) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member2_demo.json" $only_status_code)"
addCheckpoint "🎬 Ingestion Stage Complete"

curl $reportUrl -X GET $(cert_arg member1) | jq '.content[] | select (.group_status == "IN_CONSENSUS")'
addCheckpoint "🎬 IN_CONSENSUS DATA"

curl $reportUrl/$id2 -X GET $(cert_arg member0) | jq '. | {content}'
addCheckpoint "🎬 NOT_ENOUGH_DATA"

curl $reportUrl/$id3 -X GET $(cert_arg member1) | jq '. | {content}'
addCheckpoint "🎬 LACK_OF_CONSENSUS DATA"
