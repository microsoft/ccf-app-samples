#!/bin/bash
set -euo pipefail

declare app_dir=$PWD                   # application folder for reference
declare nodeAddress=""
declare certificate_dir=""
declare constitution_dir=""

function usage {
    echo ""
    echo "Start a CCF node in docker."
    echo ""
    echo "usage: ./test_docker.sh --nodeAddress <IPADDRESS:PORT> --certificate_dir <string> --constitution_dir <string>"
    echo ""
    echo "  --nodeAddress       string      The IP and port of the primary CCF node"
    echo "  --certificate_dir   string      The directory where the certificates are"
    echo "  --constitution_dir  string      The directory where the constitution is"
    echo ""
    exit 0
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [ $# -gt 6 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --nodeAddress) nodeAddress="$2"; shift;;
        --certificate_dir) certificate_dir=$2; shift;;
        --constitution_dir) constitution_dir=$2; shift;;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z "$nodeAddress" ]; then
    failed "You must supply --nodeAddress"
fi
if [ -z "$certificate_dir" ]; then
    failed "You must supply --certificate_dir"
fi
if [ -z "$constitution_dir" ]; then
    failed "You must supply --constitution_dir"
fi
if [ ! -d "$constitution_dir" ]; then
  echo "💥📁 Constitution folder not found: $constitution_dir"
  exit 1
fi

echo "▶️ Starting sandbox..."
/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle "$app_dir/dist/" --initial-member-count 3 --initial-user-count 2 --constitution-dir "$constitution_dir" > /dev/null 2>&1 &
sandbox_pid=$!
echo "💤 Waiting for sandbox . . . (${sandbox_pid})"

function finish {
  kill -9 $sandbox_pid
  echo "💀 Killed process ${sandbox_pid}"
}
trap finish EXIT

testScript="$app_dir/test/test.sh"
if [ ! -f "$testScript" ]; then
    echo "💥📂 Test file $testScript not found."
    exit 1
else
  "$testScript" --nodeAddress "${nodeAddress}" \
    --certificate_dir "$certificate_dir"
fi
