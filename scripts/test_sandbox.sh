#!/bin/bash
set -euo pipefail

declare app_dir=$PWD                   # application folder for reference
declare nodeAddress=""
declare certificate_dir=""
declare constitution_dir=""
declare interactive=0
declare ts_mode=0

function usage {
    echo ""
    echo "Start a CCF node in docker."
    echo ""
    echo "usage: ./test_docker.sh --nodeAddress <IPADDRESS:PORT> --certificate_dir <string> --constitution_dir <string> [--interactive]]"
    echo ""
    echo "  --nodeAddress       string      The IP and port of the primary CCF node"
    echo "  --certificate_dir   string      The directory where the certificates are"
    echo "  --constitution_dir  string      The directory where the constitution is"
    echo "  --interactive       boolean     Optional. Run in Demo mode"
    echo "  --typescript        boolean     Optional. Run in Typescript mode"
    echo ""
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [ $# -gt 8 ]; then
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
        --interactive) interactive=1;;
        --typescript) ts_mode=1;;
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
    if [ $interactive -eq 1 ]; then
        echo "🤔 Do you want to stop the sandbox (${sandbox_pid})? (Y/n)"
        read -r proceed
        if [ "$proceed" == "n" ]; then
            echo "👍 Sandbox will continue to run. Please stop this manually when you are done. Its process ID is above."
            exit 0
        fi
    fi
    kill -9 $sandbox_pid
    echo "💀 Killed sandbox process ${sandbox_pid}"
}
trap finish EXIT

testScript="$app_dir/test/test.sh"
if [ ! -f "$testScript" ]; then
    echo "💥📂 Test file $testScript not found."
    exit 1
fi

# build testScript command
testScript="${testScript} --nodeAddress ${nodeAddress} --certificate_dir ${certificate_dir}"
if [ $interactive -eq 1 ]; then
    testScript="${testScript} --interactive"
fi    
if [ $ts_mode -eq 1 ]; then
    testScript="${testScript} --typescript"
fi

# call testScript command
${testScript}
