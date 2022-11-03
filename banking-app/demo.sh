#!/bin/bash
set -euox pipefail

# Run `make start-host` in another terminal before running this script


cd workspace/sandbox_common

create_certificate(){
    local certName="$1"
    local certFile="${1}_cert.pem"
    local setUserFile="set_${1}.json"
    /opt/ccf/bin/keygenerator.sh --name $certName

    cert=$(< $certFile sed '$!G' | paste -sd '\\n' -)

    cat <<JSON > $setUserFile
{
  "actions": [
    {
      "name": "set_user",
      "args": {
        "cert": "${cert}"
      }
    }
  ]
}
JSON
}

create_certificate user0
create_certificate user1

cp ../../vote/* ./

user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

# Add users

# Proposal for user0
proposal0_out=$(/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @set_user0.json -H "content-type: application/json")
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
echo $proposal0_id

# Vote by member 1
/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals/$proposal0_id/ballots --cacert service_cert.pem --signing-key member1_privk.pem --signing-cert member1_cert.pem --data-binary @vote_accept.json -H "content-type: application/json" | jq
# Vote by member 2
/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals/$proposal0_id/ballots --cacert service_cert.pem --signing-key member2_privk.pem --signing-cert member2_cert.pem --data-binary @vote_accept.json -H "content-type: application/json" | jq

# Proposal for user1
proposal1_out=$(/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @set_user1.json -H "content-type: application/json")
proposal1_id=$( jq -r  '.proposal_id' <<< "${proposal1_out}" )
echo $proposal0_id

# Vote by member 1
/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals/$proposal1_id/ballots --cacert service_cert.pem --signing-key member1_privk.pem --signing-cert member1_cert.pem --data-binary @vote_accept.json -H "content-type: application/json" | jq
# Vote by member 2
/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals/$proposal1_id/ballots --cacert service_cert.pem --signing-key member2_privk.pem --signing-cert member2_cert.pem --data-binary @vote_accept.json -H "content-type: application/json" | jq


# Create accounts
account_type0='current_account'
account_type1='savings_account'
# Account for user 0
curl https://127.0.0.1:8000/app/account/$user0_id/$account_type0 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

# Account for user 1
curl https://127.0.0.1:8000/app/account/$user1_id/$account_type1 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

# Deposit: user0, 100
curl https://127.0.0.1:8000/app/deposit/$user0_id/$account_type0 -X POST --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem -H "Content-Type: application/json" --data-binary '{ "value": 100 }'

# Transfer 40 from user0 to user1
transfer_transaction_id=$(curl https://127.0.0.1:8000/app/transfer/$account_type0 -X POST -i --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
echo "transaction ID of the transfer: $transfer_transaction_id"

# Wait until the receipt becomes available
only_status_code="-s -o /dev/null -w %{http_code}"
while [ "200" != "$(curl https://127.0.0.1:8000/app/receipt?transaction_id=$transfer_transaction_id --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem $only_status_code)" ]
do
    sleep 1
done

# Get the receipt for the transfer
curl https://127.0.0.1:8000/app/receipt?transaction_id=$transfer_transaction_id --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem -s | jq

# Check balance
curl https://127.0.0.1:8000/app/balance/$account_type0 -X GET --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem

curl https://127.0.0.1:8000/app/balance/$account_type1 -X GET --cacert service_cert.pem --cert user1_cert.pem --key user1_privk.pem
