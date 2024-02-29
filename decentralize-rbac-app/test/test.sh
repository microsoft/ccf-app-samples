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

user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}') # user_admin
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}') # contributor
invalid_user_id='44299711a41fa2d0745e2a76751219342757136e814a7dcf3256e4e650644b0a' # invalid user

# -------------------------- Test cases --------------------------
echo "Test start"

# Test normal usage
# user_admin
user_admin="user_admin"
user_admin_action="manage_users"
check_eq "Create role: admin" "200" "$(curl $server/app/$user_admin/roles/$user_admin_action -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Create user: user0" "200" "$(curl $server/app/$user0_id/users/$user_admin -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "AuthZ: user0, user_admin, manage_users" "200" "$(curl $server/app/$user0_id/action/$user_admin_action $(cert_arg "user0") $only_status_code)"

# contributor, readwrite
contributor="contributor"
contributor_action="readwrite"
check_eq "Create role: contributor" "200" "$(curl $server/app/$contributor/roles/$contributor_action -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Create user: user1" "200" "$(curl $server/app/$user1_id/users/$contributor -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "AuthZ: user1, contributor, readwrite" "200" "$(curl $server/app/$user1_id/action/$contributor_action $(cert_arg "user1") $only_status_code)"

# Test cases for error handling
reader='reader'
check_eq "AuthZ: user not found" "400" "$(curl $server/app/$invalid_user_id/action/$reader $(cert_arg "user0") $only_status_code)"
check_eq "AuthZ: user action unallowed" "400" "$(curl $server/app/$user1_id/action/$reader $(cert_arg "user1") $only_status_code)"

printf "\n\n🏁 Test Completed...\n"
exit 0
