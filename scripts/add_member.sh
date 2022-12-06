#!/bin/bash

set -euo pipefail

# create set_member json proposal file
function create_member_proposal {
    local certFile=$1
    local keyFile=$2
    local setUserFile=$3

    cert=$(< $certFile sed '$!G' | paste -sd '\\n' -)
    key=$(< $keyFile sed '$!G' | paste -sd '\\n' -)

    cat <<JSON > $setUserFile
{
  "actions": [
    {
      "name": "set_member",
      "args": {
        "cert": "${cert}\n",
        "encryption_pub_key": "${key}\n"
      }
    }
  ]
}
JSON
}

function usage {
    echo ""
    echo "Generate set_member.json proposal for adding members to CCF."
    echo ""
    echo "usage: ./add_member.sh --cert-file string --pubk-file string"
    echo ""
    echo "  --cert-file     string     the certificate .pem file for the member"
    echo "  --pubk-file     string     the encryption public key .pem file for the member"
    echo ""
    exit 0
}
function failed {
    printf "Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --cert_file) cert_file="$2"; shift;;
        --pubk_file) pubk_file="$2"; shift;;
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z "$cert_file" ]; then
	failed "Missing parameter --cert-file"
elif [ -z "$pubk_file" ]; then
	failed "Missing parameter --pubk-file"
fi

echo "Looking for certificate file..."
check_existence=$(ls $cert_file 2>/dev/null || true)
if [ -z "$check_existence" ]; then
    echo "Cert file \"$cert_file\" does not exist."
    exit 0
fi

echo "Looking for public key file..."
check_existence=$(ls $pubk_file 2>/dev/null || true)
if [ -z "$check_existence" ]; then
    echo "Public key file \"$pubk_file\" does not exist."
    exit 0
fi

if [ ${cert_file##*.} != "pem" -o ${pubk_file##*.} != "pem" ]
then
    echo "Wrong file extensions. Only \".pem\" files are supported."
    exit 0
fi

certs_folder=`dirname $cert_file`
proposal_json_file="${certs_folder}/set_member.json"

echo "Creating member json proposal file..."
create_member_proposal $cert_file $pubk_file $proposal_json_file

member_id=$(openssl x509 -in "$cert_file" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

echo "proposal json file created: $proposal_json_file"
echo "member id: $member_id"
