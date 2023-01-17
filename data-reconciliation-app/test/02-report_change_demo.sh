#!/bin/bash
set -euo pipefail

declare certs="./workspace/sandbox_common"
declare server="https://127.0.0.1:8000"

# shellcheck disable=SC1091
. "./test/env_vars.sh"

cd "${certs}"

check_eq "Member0 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member0_demo_pt2.json" $only_status_code)"
addCheckpoint "🎬 Member0 successfully ingested additional data"

curl $reportUrl/$id -X GET $(cert_arg member1)  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 Data status changes for id: $id for Member1"
