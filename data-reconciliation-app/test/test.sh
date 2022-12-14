#!/bin/bash
set -euo pipefail

declare nodeAddress=""
declare certificate_dir=""

function usage {
    echo ""
    echo "Test this sample."
    echo ""
    echo "usage: ./test.sh --nodeAddress <IPADDRESS:PORT> --certificate_dir <workspace/sandbox_common>"
    echo ""
    echo "  --nodeAddress        string      The IP and port of the primary CCF node"
    echo "  --certificate_dir    string      The directory where the certificates are"
    echo ""
    exit 0
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters
if [ $# -gt 4 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --nodeAddress) nodeAddress="$2"; shift;;
        --certificate_dir) certificate_dir="$2"; shift;;
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

server="https://${nodeAddress}"

echo "📂 Working directory (for certificates): ${certificate_dir}"

check_eq() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    if [ "$expected" == "$actual" ]; then
        echo "✅ [Pass]: $test_name" 
    else
        echo "❌ [Fail]: $test_name: $expected expected, but got $actual."
        exit 1
    fi
}

cert_arg() {
    caller="$1"
    echo "--cacert service_cert.pem --cert ${caller}_cert.pem --key ${caller}_privk.pem"
}

only_status_code="-s -o /dev/null -w %{http_code}"

echo "💤 Waiting for the app frontend..."
# Using the same way as https://github.com/microsoft/CCF/blob/1f26340dea89c06cf615cbd4ec1b32665840ef4e/tests/start_network.py#L94
# There is a side effect here in the case of the sandbox as it creates the 'workspace/sandbox_common' everytime
# it starts up. The following condition not only checks that this pem file has been created, it also checks it
# is valid. Don't be caught out by the folder existing from a previous run.
while [ "200" != "$(curl "$server/app/commit" --cacert "${certificate_dir}/service_cert.pem" $only_status_code)" ]
do
    sleep 1
done

# Only when this directory has been created (or refreshed), should we change to it
# otherwise you can get permission issues.
cd "${certificate_dir}"

# -------------------------- Test cases --------------------------
echo "Test start"

printf "\n\n▶️  Member 0 - data ingestion \n"
curl $server/app/ingest -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary "@../../data-samples/member0_data.json"

printf "\n\n▶️  Member 1 - data ingestion \n"
curl $server/app/ingest -X POST $(cert_arg "member1") -H "Content-Type: application/json" --data-binary "@../../data-samples/member1_data.json"

printf "\n\n▶️  Member 2 - data ingestion \n"
curl $server/app/ingest -X POST $(cert_arg "member2") -H "Content-Type: application/json" --data-binary "@../../data-samples/member2_data.json"

printf "\n\n✅ Member 0 - read data report \n"
curl $server/app/report -X GET $(cert_arg "member0")

printf "\n\n✅ Member 1 - read data report \n"
curl $server/app/report -X GET $(cert_arg "member1")

printf "\n\n✅ Member 2 - read data report \n"
curl $server/app/report -X GET $(cert_arg "member2")

# ----------------------------------------------------

printf "\n\n✅ Test Completed...\n"
exit 0

# ----------------------------------------------------

