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

printf "\n\n🏁 Test Completed...\n"
exit 0
