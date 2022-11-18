#!/bin/bash

# -------------------------- Preparation --------------------------

echo "Building app..."
npm run build > /dev/null 2>&1

# Run sandbox.
echo "Starting sandbox..."
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 1 --initial-user-count 1 > /dev/null 2>&1 &
sandbox_pid=$!

check_eq() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    echo -n "$test_name: "
    if [ "$expected" == "$actual" ]; then
        echo "[Pass]"
    else
        echo "[Fail]: $expected expected, but got $actual"
        (kill -9 $sandbox_pid)
        exit 1
    fi
}

cert_arg() {
    caller="$1"
    echo "--cacert service_cert.pem --cert ${caller}_cert.pem --key ${caller}_privk.pem"
}

server="https://127.0.0.1:8000"
only_status_code="-s -o /dev/null -w %{http_code}"

echo "Waiting for the app frontend..."
# Using the same way as https://github.com/microsoft/CCF/blob/1f26340dea89c06cf615cbd4ec1b32665840ef4e/tests/start_network.py#L94
while [ "200" != "$(curl $server/app/commit --cacert workspace/sandbox_common/service_cert.pem $only_status_code)" ]
do
    sleep 1
done

cd workspace/sandbox_common

user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

# -------------------------- Test cases --------------------------
echo "Test start"

echo "--- Normal Usage without historical queries ---"
check_eq "Post item0" "200" "$(curl $server/app/log?log_id=0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "hello" }' $only_status_code)"
check_eq "Post item10" "200" "$(curl $server/app/log?log_id=10 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "hello 10" }' $only_status_code)"
check_eq "Try to get item0, but should fail" "403" "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") $only_status_code)"
check_eq "Allow user0 to access items with ID from 0 to 9" "204" "$(curl $server/app/users/$user0_id/permission -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{"startLogId": 0, "endLogId": 9, "allowOnlyLatestSeqNo": true}' $only_status_code)"
check_eq "Get item0" '{"message":"hello"}' "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") --silent)"
check_eq "Try to get item10, but should fail" "403" "$(curl $server/app/log?log_id=10 -X GET $(cert_arg "user0") $only_status_code)"
check_eq "Disallow user0 to access item0 (maybe after audit)" "204" "$(curl $server/app/users/$user0_id/permission -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{}' $only_status_code)"
check_eq "Try to get item0, but should fail" "403" "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") $only_status_code)"

echo "--- Normal Usage with historical queries ---"
transaction_id_for_updating_item0=$(curl $server/app/log?log_id=0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "updated hello" }' -i --silent | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
# echo $transaction_id_for_updating_item0 # output: 2.11
seqno_for_updating_item0=$(echo $transaction_id_for_updating_item0 | awk '{split($0,a,"."); print a[2]}')
# echo $seqno_for_updating_item0 # output: 11
# end_seq_no=$((seqno_for_updating_item0-1))
end_seq_no=$((seqno_for_updating_item0 - 1))
echo $end_seq_no
check_eq "Allow user0 to access items with seqno from 0 to $end_seq_no" "204" "$(curl $server/app/users/$user0_id/permission -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary "{\"allowAnyLogId\": true, \"startSeqNo\": 0, \"endSeqNo\": $end_seq_no}" $only_status_code)"
check_eq "Try to get item0, but should fail" "403" "$(curl $server/app/log?log_id=0 -X GET $(cert_arg "user0") $only_status_code)"
echo "Waiting for the historical query to be available..."
while [ "200" != "$(curl "$server/app/log?log_id=0&seq_no=$end_seq_no" -X GET $(cert_arg "user0") $only_status_code)" ]
do
    sleep 1
done
check_eq "Get item0 with seqno=$end_seq_no (old contents)" '{"message":"hello"}' "$(curl "$server/app/log?log_id=0&seq_no=$end_seq_no" -X GET $(cert_arg "user0") --silent)"

echo "OK"
kill -9 $sandbox_pid
exit 0
