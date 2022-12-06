#!/bin/bash
set -euo pipefail

declare app_dir=$PWD                   # application folder for reference

echo "▶️ Starting sandbox..."
/opt/ccf/bin/sandbox.sh --js-app-bundle $app_dir/dist/ --initial-member-count 3 --initial-user-count 2 --constitution-dir $app_dir/constitution > /dev/null 2>&1 &
sandbox_pid=$!
echo "💤 Waiting for sandbox . . . (${sandbox_pid})"

function finish {
  kill -9 $sandbox_pid
  echo "💀 Killed process ${sandbox_pid}"
}
trap finish EXIT

check_existence=$(ls $app_dir/test/test.sh 2>/dev/null || true)
if [ -z "$check_existence" ]; then
    failed "You are missing a test.sh script in your application."
    exit 0
fi

# If we source this - it will run in this process and honour
# the argument parsing
source $app_dir/test/test.sh
