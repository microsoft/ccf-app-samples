#!/bin/bash
set -euo pipefail

# This is a bit brutal as what if other python processes were running?
pid=$(pgrep -n python)
kill -9 $pid
echo "💀 Killed process ${pid}"