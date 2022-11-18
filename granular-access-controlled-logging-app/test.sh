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

check_eq "Post an item0" "200" "$(curl $server/app/log?id=0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "hello" }' $only_status_code)"
check_eq "Post an item101" "200" "$(curl $server/app/log?id=101 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "message": "hello 101" }' $only_status_code)"
check_eq "Try to get an item0, but should fail" "403" "$(curl $server/app/log?id=0 -X GET $(cert_arg "user0") $only_status_code)"
check_eq "Allow user0 to access item0" "204" "$(curl $server/app/users/$user0_id/permission -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{"startLogId": 0, "endLogId": 100}' $only_status_code)"
check_eq "Get an item0" '{"message":"hello"}' "$(curl $server/app/log?id=0 -X GET $(cert_arg "user0") --silent)"
check_eq "Try to get an item101, but should fail" "403" "$(curl $server/app/log?id=101 -X GET $(cert_arg "user0") $only_status_code)"
check_eq "Disallow user0 to access item0" "204" "$(curl $server/app/users/$user0_id/permission -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{"allowAnyLogId": false}' $only_status_code)"
check_eq "Try to get an item0, but should fail" "403" "$(curl $server/app/log?id=0 -X GET $(cert_arg "user0") $only_status_code)"

echo "OK"
kill -9 $sandbox_pid
exit 0
