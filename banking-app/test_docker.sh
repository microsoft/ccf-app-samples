#!/bin/bash
set -euo pipefail

declare enclave_type=""

function usage {
    echo ""
    echo "Test this sample running in docker."
    echo ""
    echo "usage: ./test_docker.sh [--virtual] [--enclave]"
    echo ""
    echo "  --virtual   string      Run this in a virtual node"
    echo "  --enclave   string      Run this in a SGX node"
    echo ""
    exit 0
}

function failed {
    printf "Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [[ $# -eq 0 || $# -gt 1 ]]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --virtual) enclave_type="virtual";;
        --enclave) enclave_type="enclave";;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z $enclave_type ]; then
    failed "You must supply --virtual or --enclave"
fi

# create certificate files
create_certificate(){
    local certName="$1"
    local certFile="${1}_cert.pem"
    local setUserFile="set_${1}.json"
    /opt/ccf/bin/keygenerator.sh --name $certName --gen-enc-key
}


# Prepare a test network by adding a member 
# and two users to the network, and then open it
create_test_network_proposal(){

    create_certificate "user0"
    create_certificate "user1"
    create_certificate "member1"

    local user0_cert=$(< user0_cert.pem sed '$!G' | paste -sd '\\n' -)
    local user1_cert=$(< user1_cert.pem sed '$!G' | paste -sd '\\n' -)
    local member1_cert=$(< member1_cert.pem sed '$!G' | paste -sd '\\n' -)
    local member1_encryption_pub_key=$(< member1_enc_pubk.pem sed '$!G' | paste -sd '\\n' -)
    local service_cert=$(< service_cert.pem sed '$!G' | paste -sd '\\n' -)

    local proposalFileName="network_open_proposal.json"
    cat <<JSON > $proposalFileName
{
  "actions": [
    {
      "name": "set_member",
      "args": {
        "cert": "${member1_cert}\n",
        "encryption_pub_key": "${member1_encryption_pub_key}\n"
      }
    },
    {
      "name": "set_user",
      "args": {
        "cert": "${user0_cert}\n"
      }
    },
    {
      "name": "set_user",
      "args": {
        "cert": "${user1_cert}\n"
      }
    },
    {
      "name": "transition_service_to_open",
      "args": {
        "next_service_identity": "${service_cert}\n"
      }
    }
  ]
}
JSON
}

##############################################
# Discover docker configuration
##############################################
containerId=$(docker ps -f ancestor=banking-app:$enclave_type -q)
docker cp "$containerId:/app/service_cert.pem" ./workspace/docker_certificates
dockerIPAddress=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $containerId)
server="https://${dockerIPAddress}:8080"

##############################################
# Create all the certs in a well known directory
##############################################
cd workspace/docker_certificates

##############################################
# Activate member 0
##############################################
echo "Getting list of members..."
curl $server/gov/members \
    --cacert service_cert.pem \
    | jq

curl "${server}/gov/ack/update_state_digest" \
    -X POST \
    --cacert service_cert.pem \
    --key member0_privk.pem \
    --cert member0_cert.pem \
    --silent | jq > activation.json

echo "Show digest"
cat activation.json

/opt/ccf/bin/scurl.sh "${server}/gov/ack" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --header "Content-Type: application/json" \
    --data-binary @activation.json

echo "Getting list of members..."
curl ${server}/gov/members \
    --cacert service_cert.pem \
    | jq

##############################################
# Generate Proposals
##############################################
create_test_network_proposal

##############################################
# Open Network
##############################################
echo "Open the network"
network_proposal_out=$(/opt/ccf/bin/scurl.sh "${server}/gov/proposals" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @network_open_proposal.json \
    -H "content-type: application/json")
echo ${network_proposal_out} | jq
network_proposal_out_id=$( jq -r  '.proposal_id' <<< "${network_proposal_out}" )

echo "Network Proposal ID: $network_proposal_out_id"
/opt/ccf/bin/scurl.sh "${server}/gov/proposals/$network_proposal_out_id/ballots" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @vote_accept.json \
    -H "content-type: application/json" | jq

##############################################
# Propose users and application
##############################################
application_proposal_out=$(/opt/ccf/bin/scurl.sh "${server}/gov/proposals" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @../../dist/set_js_app.json \
    -H "content-type: application/json")
application_proposal_out_id=$( jq -r  '.proposal_id' <<< "${application_proposal_out}" )
echo "Application Proposal ID: ${application_proposal_out_id}"
/opt/ccf/bin/scurl.sh "${server}/gov/proposals/${application_proposal_out_id}/ballots" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @vote_accept.json \
    -H "content-type: application/json" | jq

##############################################
# Test Network
##############################################
curl "${server}/node/network" --cacert service_cert.pem | jq

# -------------------------- Preparation --------------------------

check_eq() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    echo -n "$test_name: "
    if [ "$expected" == "$actual" ]; then
        echo "[Pass]"
    else
        echo "[Fail]: $expected expected, but got $actual"
        exit 1
    fi
}

cert_arg() {
    caller="$1"
    echo "--cacert service_cert.pem --cert ${caller}_cert.pem --key ${caller}_privk.pem"
}

only_status_code="-s -o /dev/null -w %{http_code}"

#curl ${server}/app/commit --cacert service_cert.pem | jq
echo "Waiting for the app frontend..."
# Using the same way as https://github.com/microsoft/CCF/blob/1f26340dea89c06cf615cbd4ec1b32665840ef4e/tests/start_network.py#L94
while [ "200" != "$(curl ${server}/app/commit --cacert service_cert.pem $only_status_code)" ]
do
    sleep 1
done

user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

account_type0='current_account'
account_type1='savings_account'

# -------------------------- Test cases --------------------------
echo "Test start"

# Test normal usage
check_eq "Create account: user0" "204" "$(curl $server/app/account/$user0_id/$account_type0 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Create account: user1" "204" "$(curl $server/app/account/$user1_id/$account_type1 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Deposit: user0, 100" "204" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100 }' $only_status_code)"
check_eq "Transfer: 40 from user0 to user1" "204" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Balance: user0, account_type0" "{\"balance\":60}" "$(curl $server/app/balance/$account_type0 -X GET $(cert_arg "user0") -s)"
check_eq "Balance: user1, account_type1" "{\"balance\":40}" "$(curl $server/app/balance/$account_type1 -X GET $(cert_arg "user1") -s)"

# Test receipt
transfer_transaction_id=$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 5, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" -i -s | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
# Wait for receipt to be ready
while [ "200" != "$(curl $server/app/receipt?transaction_id=$transfer_transaction_id $(cert_arg "user0") $only_status_code)" ]
do
    sleep 1
done
check_eq "Get receipt for transfer" "200" "$(curl $server/app/receipt?transaction_id=$transfer_transaction_id $(cert_arg "user0") $only_status_code)"
check_eq "Verify receipt" "OK" "$(curl $server/app/receipt?transaction_id=$transfer_transaction_id $(cert_arg "user0") -s | ../../verify_receipt.sh)"

# Test cases for error handling and coner cases
check_eq "Create account: user0 again" "204" "$(curl $server/app/account/$user0_id/$account_type0 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Create account: user not found" "404" "$(curl $server/app/account/non-existing-user/$account_type0 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Deposit: invalid value (non integer 1)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": "abc" }' $only_status_code)"
check_eq "Deposit: invalid value (non integer 2)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100.5 }' $only_status_code)"
check_eq "Deposit: invalid value (zero)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 0 }' $only_status_code)"
check_eq "Deposit: invalid value (negative value)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": -100 }' $only_status_code)"
check_eq "Deposit: user not found" "404" "$(curl $server/app/deposit/non-existing-user/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100 }' $only_status_code)"
check_eq "Deposit: account not found" "404" "$(curl $server/app/deposit/$user0_id/"non-existing-account" -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100 }' $only_status_code)"
check_eq "Transfer: not enough balance" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 100000, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (non integer 1)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": "abc", \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (non integer 2)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 100.5, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (zero)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 0, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (negative value)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": -100, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: account not found" "404" "$(curl $server/app/transfer/non-existing-account -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: userTo not found" "404" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"non-existing-user\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: accountTo not found" "404" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"non-existing-account\" }" $only_status_code)"
check_eq "Balance: account not found" "404" "$(curl $server/app/balance/non-existing-account -X GET $(cert_arg "user0") $only_status_code)"

echo "OK"
exit 0
