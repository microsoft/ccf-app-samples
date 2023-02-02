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

user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

# -------------------------- Test cases --------------------------
echo "Test start"

echo "--- Normal Usage without historical queries ---"
res_post_item0=$(curl $server/app/log?log_id=0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "hello" }' -i --silent)
check_eq "Posting item0 returns 204" "204" "$(echo "$res_post_item0" | grep -i HTTP/1.1 | awk '{print $2}' | sed -e 's/\r//g')"
transaction_id_for_post_item0=$(echo "$res_post_item0" | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
seqno_for_post_item0=$(echo $transaction_id_for_post_item0 | awk '{split($0,a,"."); print a[2]}')
check_eq "Post item10" "204" "$(curl $server/app/log?log_id=10 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "hello 10" }' $only_status_code)"
check_eq "Try to get item0, but should fail" "403" "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") $only_status_code)"
check_eq "Allow user0 to access items with ID from 0 to 9" "204" "$(curl $server/app/users/$user0_id/permission -X PUT $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{"startLogId": 0, "lastLogId": 9, "allowOnlyLatestSeqNo": true}' $only_status_code)"
check_eq "Get item0" '{"message":"hello"}' "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") --silent)"
check_eq "Try to get item10, but should fail" "403" "$(curl $server/app/log?log_id=10 -X GET $(cert_arg "user0") $only_status_code)"
check_eq "Disallow user0 to access item0 (maybe after audit)" "204" "$(curl $server/app/users/$user0_id/permission -X PUT $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{}' $only_status_code)"
check_eq "Try to get item0, but should fail" "403" "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") $only_status_code)"

echo "--- Normal Usage with historical queries ---"
check_eq "Update item0" "204" "$(curl $server/app/log?log_id=0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "updated hello" }' $only_status_code)"
check_eq "Allow user0 to access items with seqno from 0 to $seqno_for_post_item0" "204" "$(curl $server/app/users/$user0_id/permission -X PUT $(cert_arg "member0") -H "Content-Type: application/json" --data-binary "{\"allowAnyLogId\": true, \"startSeqNo\": 0, \"lastSeqNo\": $seqno_for_post_item0}" $only_status_code)"
check_eq "Try to get item0, but should fail because it's not allowed to access" "403" "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") $only_status_code)"
echo "Waiting for the historical query to be available..."
while [ "200" != "$(curl "$server/app/log?log_id=0&seq_no=$seqno_for_post_item0" -X GET $(cert_arg "user0") $only_status_code)" ]
do
    sleep 1
done
check_eq "Get item0 with seqno=$seqno_for_post_item0 (old contents)" '{"message":"hello"}' "$(curl "$server/app/log?log_id=0&seq_no=$seqno_for_post_item0" -X GET $(cert_arg "user0") --silent)"

echo "--- Error handling---"
check_eq "Invalid permission 0" "400" "$(curl $server/app/users/$user0_id/permission -X PUT $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{"startLogId": 0, "lastLogId": 9, "allowAnyLogId": true, "allowOnlyLatestSeqNo": true}' $only_status_code)"
check_eq "Invalid permission 1" "400" "$(curl $server/app/users/$user0_id/permission -X PUT $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{"allowAnyLogId": true, "startSeqNo": 0, "lastSeqNo": 9, "allowAnySeqNo": true}' $only_status_code)"

printf "\n\n🏁 Test Completed...\n"
exit 0
