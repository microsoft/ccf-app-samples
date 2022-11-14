#!/bin/bash
set -euox pipefail

# Run The application demo Test Scenario

# Define user accounts Id
user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

# Create accounts
account_type0='current_account'
account_type1='savings_account'

# Create account for user 0
curl https://127.0.0.1:8000/app/account/$user0_id/$account_type0 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

# Create account for user 1
curl https://127.0.0.1:8000/app/account/$user1_id/$account_type1 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

# Deposit: user0, 100
curl https://127.0.0.1:8000/app/deposit/$user0_id/$account_type0 -X POST --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem -H "Content-Type: application/json" --data-binary '{ "value": 100 }'

# Transfer 40 from user0 to user1
transfer_transaction_id=$(curl https://127.0.0.1:8000/app/transfer/$account_type0 -X POST -i --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
# "transaction ID of the transfer: $transfer_transaction_id"

# Wait until the receipt becomes available
only_status_code="-s -o /dev/null -w %{http_code}"
while [ "200" != "$(curl https://127.0.0.1:8000/app/receipt?transaction_id=$transfer_transaction_id --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem $only_status_code)" ]
do
    sleep 1
done

# Get the receipt for the transfer
curl https://127.0.0.1:8000/app/receipt?transaction_id=$transfer_transaction_id --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem -s | jq

# Check user0 balance
curl https://127.0.0.1:8000/app/balance/$account_type0 -X GET --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem

# Check user1 balance
curl https://127.0.0.1:8000/app/balance/$account_type1 -X GET --cacert service_cert.pem --cert user1_cert.pem --key user1_privk.pem

