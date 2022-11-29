#!/bin/bash
set -euo pipefail

echo "▶️ Starting sandbox..."
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 2 --constitution-dir ./constitution > /dev/null 2>&1 &
sandbox_pid=$!
echo "💤 Waiting for sandbox . . . (${sandbox_pid})"

function finish {
  kill -9 $sandbox_pid
  echo "💀 Killed process ${sandbox_pid}"
}
trap finish EXIT

# If we source this - it will run in this process and honour
# the argument parsing
source ./scripts/test.sh
