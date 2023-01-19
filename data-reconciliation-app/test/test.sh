#!/bin/bash
set -euo pipefail

declare nodeAddress=""
declare certificate_dir=""
declare interactive=0

function usage {
    echo ""
    echo "Test this sample."
    echo ""
    echo "usage: ./test.sh --nodeAddress <IPADDRESS:PORT> --certificate_dir <workspace/sandbox_common> [--interactive]"
    echo ""
    echo "  --nodeAddress        string      The IP and port of the primary CCF node"
    echo "  --certificate_dir    string      The directory where the certificates are"
    echo "  --interactive        boolean     Optional. Run in Demo mode"
    echo ""
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters
if [ $# -gt 5 ]; then
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
        --interactive) interactive=1;;
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

function addCheckpoint {
    if [ $interactive -eq 1 ]; then
        printf "%s\n\n" "${1}"
        read -n1 -r -p "- Press any key to continue..."
        printf "\n"
    fi
}

only_status_code="-s -o /dev/null -w %{http_code}"

if [ $interactive -eq 1 ]; then
    echo "💣 You are running in demo mode - don't forget to check your network is running..."
fi
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

ingestUrl="$server/app/ingest"
ingestCsvUrl="$server/app/csv/ingest"
reportUrl="$server/app/report"
id="9845001D460PEJE54159"
#id1="984500E1B2CA1D4EKG67"
id2="984500BA57A56NBD3A24"
id3="9845001D460PEJE54159"

check_eq "member0 - Getting report without ingesting data should fail as 'No Data to Report' " "400" "$(curl $reportUrl -X GET $(cert_arg member0) -H "Content-Type: application/json" $only_status_code)"

printf "\n  -------- Test Ingestion Service --------  \n\n"

check_eq "Member0 - data ingest through CSV should succeed" "200" "$(curl $ingestCsvUrl -X POST $(cert_arg member0) -H "Content-Type: text/csv" --data-binary "@../../test/data-samples/member0_data.csv" $only_status_code)"

check_eq "Member1 - data ingest failed (data length is zero)" "400" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "[]" $only_status_code)"

check_eq "Member1 - data ingest failed (data is null)" "400" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "" $only_status_code)"

check_eq "Member1 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member1) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member1_demo.json" $only_status_code)"

check_eq "Member2 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member2) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member2_demo.json" $only_status_code)"
addCheckpoint "🎬 Ingestion Stage Complete"

printf "\n -------- Test Reporting Service (GetAll) --------  \n\n"

memberName="member0"
check_eq "$memberName - Getting all data records should succeed" "200" "$(curl $reportUrl -X GET $(cert_arg $memberName) -H "Content-Type: application/json" $only_status_code)"
printf " Response: "
curl $server/app/report -X GET $(cert_arg $memberName)
printf "\n\n"

memberName="member1"
check_eq "$memberName - Getting all data records should succeed" "200" "$(curl $reportUrl -X GET $(cert_arg $memberName) -H "Content-Type: application/json" $only_status_code)"
printf " Response: "
curl $server/app/report -X GET $(cert_arg $memberName)
printf "\n\n"

memberName="member2"
check_eq "$memberName - Getting all data records should succeed" "200" "$(curl $reportUrl -X GET $(cert_arg $memberName) -H "Content-Type: application/json" $only_status_code)"
printf " Response: "
curl $server/app/report -X GET $(cert_arg $memberName)
printf "\n\n"

printf "\n -------- Test Reporting Service (GetById) --------  \n\n"

check_eq "member1 - Getting data record by key should succeed" "200" "$(curl $reportUrl/$id3 -X GET $(cert_arg member1) -H "Content-Type: application/json" $only_status_code)"
check_eq "member1 - Getting data record by key_not_exist should fail" "400" "$(curl $reportUrl/10 -X GET $(cert_arg member1) -H "Content-Type: application/json" $only_status_code)"

curl $reportUrl -X GET $(cert_arg member1)  --no-progress-meter | jq '.content[] | select (.group_status == "IN_CONSENSUS")'
addCheckpoint "🎬 IN_CONSENSUS DATA"

curl $reportUrl/$id2 -X GET $(cert_arg member0)  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 NOT_ENOUGH_DATA"

curl $reportUrl/$id3 -X GET $(cert_arg member1)  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 LACK_OF_CONSENSUS DATA"

printf "\n  -------- Report Change --------  \n\n"

check_eq "Member0 - data ingest succeed" "200" "$(curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/member0_demo_pt2.json" $only_status_code)"
addCheckpoint "🎬 Member0 successfully ingested additional data"

curl $reportUrl/$id -X GET $(cert_arg member1)  --no-progress-meter | jq '. | {content}'
echo "🎬 Data status changes for id: $id for Member1"

printf "\n\n🏁 Test Completed...\n"
exit 0

# ----------------------------------------------------

