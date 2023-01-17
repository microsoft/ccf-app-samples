#!/bin/bash
set -euo pipefail

declare certs="./workspace/sandbox_common"
declare server="https://127.0.0.1:8000"

mkdir -p ./test/reports
sudo rm -rf ./test/reports/*.json
# shellcheck disable=SC1091
. "./test/env_vars.sh"

cd "${certs}"

check_eq "Member0 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member0_demo_pt1.json" $only_status_code)"

check_eq "Member1 - data ingest failed (data is null or empty)" "400" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "" $only_status_code)"

check_eq "Member1 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member1_demo.json" $only_status_code)"

check_eq "Member2 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member2) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member2_demo.json" $only_status_code)"
addCheckpoint "🎬 Ingestion Stage Complete"

curl $reportUrl -X GET $(cert_arg member1)  --no-progress-meter | jq '.content[] | select (.group_status == "IN_CONSENSUS")'
addCheckpoint "🎬 IN_CONSENSUS DATA"

curl $reportUrl/$id2 -X GET $(cert_arg member0)  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 NOT_ENOUGH_DATA"

curl $reportUrl/$id3 -X GET $(cert_arg member1)  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 LACK_OF_CONSENSUS DATA"
