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

printf "\n  -------- Test Ingestion Service --------  \n\n"

memberName="member0"
check_eq "${memberName} - CSV data ingest failed (wrong file)"   "400" "$(curl $ingestCsvUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: text/csv" --data-binary "@../../test/data-samples/${memberName}_data_pt2.json" $only_status_code)"
check_eq "${memberName} - CSV data ingest failed (wrong schema)" "400" "$(curl $ingestCsvUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: text/csv" --data-binary "@../../test/data-samples/${memberName}_wrong_schema.csv" $only_status_code)"
check_eq "${memberName} - CSV data ingest succeeded"             "200" "$(curl $ingestCsvUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: text/csv" --data-binary "@../../test/data-samples/${memberName}_data.csv" $only_status_code)"

printf " ---\n"
memberName="member1"
check_eq "${memberName} - JSON data ingest failed (data length is zero)" "400" "$(curl $ingestUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: application/json" --data-binary "[]" $only_status_code)"
check_eq "${memberName} - JSON data ingest failed (data is null)"        "400" "$(curl $ingestUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: application/json" --data-binary "" $only_status_code)"
check_eq "${memberName} - JSON data ingest succeeded"                    "200" "$(curl $ingestUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/${memberName}_data.json" $only_status_code)"

printf " ---\n"
memberName="member2"
check_eq "${memberName} - JSON data ingest succeeded" "200" "$(curl $ingestUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/${memberName}_data.json" $only_status_code)"

addCheckpoint "🎬 Ingestion Stage Complete"

printf "\n -------- Test Reporting Service (Full Report) --------  \n\n"

userName="user0"
check_eq "${userName} - Getting report without ingesting data should fail as 'No Data to Report' " "400" "$(curl $reportUrl -X GET $(cert_arg ${userName}) -H "Content-Type: application/json" $only_status_code)"

memberName="member0"
check_eq "${memberName} - Getting all data records should succeed" "200" "$(curl $reportUrl -X GET $(cert_arg ${memberName}) -H "Content-Type: application/json" $only_status_code)"

memberName="member1"
check_eq "${memberName} - Getting all data records should succeed" "200" "$(curl $reportUrl -X GET $(cert_arg ${memberName}) -H "Content-Type: application/json" $only_status_code)"

memberName="member2"
check_eq "${memberName} - Getting all data records should succeed" "200" "$(curl $reportUrl -X GET $(cert_arg ${memberName}) -H "Content-Type: application/json" $only_status_code)"

memberName="member1"
printf "\n${memberName} Full Report:\n"
curl $server/app/report -X GET $(cert_arg $memberName) --no-progress-meter | jq '.content[]'
printf "\n"
addCheckpoint "🎬 Full Reports Complete"


printf "\n -------- Test Reporting Service (GetById) --------  \n\n"

id_inConsensus="984500F5BD5BE5767C51"
id_notEnoughData="984500BA57A56NBD3A24"
id_lackOfConsensus="9845001D460PEJE54159"
#group status for this key changes from LackOfConsensus to InConsensus during the demo 
id_newGroupStatus=$id_lackOfConsensus

memberName="member2"
check_eq "${memberName} - Getting report by key_not_exist should fail" "400" "$(curl $reportUrl/10 -X GET $(cert_arg ${memberName}) -H "Content-Type: application/json" $only_status_code)"
check_eq "${memberName} - Getting report by key should succeed"        "200" "$(curl $reportUrl/$id_inConsensus -X GET $(cert_arg ${memberName}) -H "Content-Type: application/json" $only_status_code)"

printf "\n${memberName} - In Consensus GroupStatus Example: id: ${id_inConsensus}\n"
curl $reportUrl/$id_inConsensus -X GET $(cert_arg ${memberName})  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 IN_CONSENSUS DATA"

printf "\n${memberName} - Not Enough Data GroupStatus Example: id: ${id_notEnoughData}\n"
curl $reportUrl/$id_notEnoughData -X GET $(cert_arg ${memberName})  --no-progress-meter | jq '. | {content}'
addCheckpoint "🎬 NOT_ENOUGH_DATA"

printf "\n${memberName} - Lack of Consensus GroupStatus Example: id: ${id_lackOfConsensus}\n"
curl $reportUrl/$id_lackOfConsensus -X GET $(cert_arg ${memberName})  --no-progress-meter | jq '. | {content}'

addCheckpoint "🎬 LACK_OF_CONSENSUS DATA"

printf "\n  -------- Report Change --------  \n\n"

memberName="member0"
check_eq "${memberName} - JSON data ingest succeeded" "200" "$(curl $ingestUrl -X POST $(cert_arg ${memberName}) -H "Content-Type: application/json" --data-binary "@../../test/data-samples/${memberName}_data_pt2.json" $only_status_code)"
printf "🎬 ${memberName} successfully ingested additional/updated data.\n"

memberName="member2"
printf "\n${memberName} - Data status changes for id: $id_newGroupStatus:\n"
curl $reportUrl/$id_newGroupStatus -X GET $(cert_arg ${memberName})  --no-progress-meter | jq '. | {content}'

addCheckpoint "🎬 Updated Report after New Data Submission"

# ----------------------------------------------------
# Assertions' Checks 
# ----------------------------------------------------

assert_report_field() {
    local memberName="$1"
    local recordId="$2"
    local fieldName="$3"
    local expectedValue="$4"  

    # extract current value by filtering the field of interest from the member report  
    currentValue=$(curl $reportUrl/$recordId -X GET $(cert_arg ${memberName})  --no-progress-meter | jq ".content.${fieldName}")
    
    check_eq "Assert $memberName::$recordId.$fieldName == $expectedValue" "${expectedValue}" "${currentValue}" 
}

memberName="member2"
recordId=$id_inConsensus
printf "\nChecking ALL fields for ${memberName} and id ${recordId} (In Consensus)\n"
assert_report_field "${memberName}" ${recordId} "group_status"           "\"IN_CONSENSUS\"" 
assert_report_field "${memberName}" ${recordId} "majority_minority"      "\"Majority\"" 
assert_report_field "${memberName}" ${recordId} "count_of_unique_values" "1" 
assert_report_field "${memberName}" ${recordId} "members_in_agreement"   "3" 
assert_report_field "${memberName}" ${recordId} "lei"                    "\"${id_inConsensus}\"" 
assert_report_field "${memberName}" ${recordId} "nace"                   "\"C.18.13\"" 

memberName="member2"
recordId="9845002B6B074505A715"
printf "\nChecking fields for ${memberName} and id ${recordId} (Not Enough Data with Minority of votes)\n" 
assert_report_field "${memberName}" ${recordId} "group_status"           "\"NOT_ENOUGH_DATA\"" 
assert_report_field "${memberName}" ${recordId} "majority_minority"      "\"Minority\"" 
assert_report_field "${memberName}" ${recordId} "count_of_unique_values" "2" 
assert_report_field "${memberName}" ${recordId} "members_in_agreement"   "1" 

memberName="member2"
recordId="984500BA57A56NBD3A24"
printf "\nChecking fields for ${memberName} and id ${recordId} (Not Enough Data with Majority of votes)\n"
assert_report_field "${memberName}" ${recordId} "group_status"           "\"NOT_ENOUGH_DATA\"" 
assert_report_field "${memberName}" ${recordId} "majority_minority"      "\"Majority\"" 
assert_report_field "${memberName}" ${recordId} "count_of_unique_values" "1" 
assert_report_field "${memberName}" ${recordId} "members_in_agreement"   "2" 

memberName="member2"
recordId="984500E1B2CA1D4EKG67"
printf "\nChecking fields for ${memberName} and id ${recordId} (Lack of Consensus with Majority of votes)\n"
assert_report_field "${memberName}" ${recordId} "group_status"           "\"LACK_OF_CONSENSUS\"" 
assert_report_field "${memberName}" ${recordId} "majority_minority"      "\"Majority\"" 
assert_report_field "${memberName}" ${recordId} "count_of_unique_values" "2" 
assert_report_field "${memberName}" ${recordId} "members_in_agreement"   "2" 

memberName="member0"
recordId="984500E1B2CA1D4EKG67"
printf "\nChecking fields for ${memberName} and id ${recordId} (Lack of Consensus with Minority of votes)\n"
assert_report_field "${memberName}" ${recordId} "group_status"           "\"LACK_OF_CONSENSUS\"" 
assert_report_field "${memberName}" ${recordId} "majority_minority"      "\"Minority\"" 
assert_report_field "${memberName}" ${recordId} "count_of_unique_values" "2" 
assert_report_field "${memberName}" ${recordId} "members_in_agreement"   "1" 

memberName="member0"
recordId="984500F5BD5BE5767C51"
printf "\nChecking fields for ${memberName} and id ${recordId} (In Consensus)\n"
assert_report_field "${memberName}" ${recordId} "group_status"           "\"IN_CONSENSUS\"" 
assert_report_field "${memberName}" ${recordId} "count_of_unique_values" "1" 
assert_report_field "${memberName}" ${recordId} "members_in_agreement"   "3" 

memberName="member1"
recordId="984500E1B2CA1D4EKG67"
printf "\nChecking fields for ${memberName} and id ${recordId} (Lack Of Consensus)\n"
assert_report_field "${memberName}" ${recordId} "group_status" "\"LACK_OF_CONSENSUS\"" 

memberName="member1"
recordId="984500F5BD5BE5767C51"
printf "\nChecking fields for ${memberName} and id ${recordId} (In Consensus)\n"
assert_report_field "${memberName}" ${recordId} "group_status" "\"IN_CONSENSUS\"" 

printf "\n\n🏁 Test Completed...\n"
exit 0
