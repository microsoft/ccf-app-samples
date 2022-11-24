#!/bin/bash

# -------------------------- Preparation --------------------------

echo "Building app..."
npm run build > /dev/null 2>&1

# Run sandbox.
echo "Starting sandbox..."
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 3 > /dev/null 2>&1 &
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

user_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
friend0_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
stranger0_id=$(openssl x509 -in "user2_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user_number='12340001'
friend0_number='12340002'
stranger0_number='12340003'
friend1_number='12340004' # Not in CCF
friend2_number='12340005' # Not in CCF

# -------------------------- Test cases --------------------------
echo "Test start"

echo "OK"
kill -9 $sandbox_pid
exit 0
