#!/bin/bash

# -------------------------- Preparation --------------------------

echo "Building app..."
npm run build > /dev/null 2>&1

# Run sandbox. Consider 3 members as 3 banks.
echo "Starting sandbox..."
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 2 > /dev/null 2>&1 &
sandbox_pid=$!

server="https://127.0.0.1:8000"
only_status_code="-s -o /dev/null -w %{http_code}"

echo "Waiting for the app frontend..."
# Using the same way as https://github.com/microsoft/CCF/blob/1f26340dea89c06cf615cbd4ec1b32665840ef4e/tests/start_network.py#L94
while [ "200" != "$(curl $server/app/log -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done

echo "Starting Test..."
curl -X POST $server/app/log?id=1 -k -H "Content-Type: application/json" --data '{"msg": "Hello Data-reconciliation-app!"}' 
curl $server/app/log?id=1 -k

echo ""
echo "Test Completed..."
echo "OK"
kill -9 $sandbox_pid
exit 0
