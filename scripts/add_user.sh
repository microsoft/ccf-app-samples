#!/bin/bash

set -euo pipefail

# create set_user json proposal file
function create_user_proposal {
    local certFile=$1
    local setUserFile=$2

    cert=$(< $certFile sed '$!G' | paste -sd '\\n' -)

    cat <<JSON > $setUserFile
{
  "actions": [
    {
      "name": "set_user",
      "args": {
        "cert": "${cert}\n"
      }
    }
  ]
}
JSON
}

function usage {
    echo ""
    echo "Generate set_user.json proposal for adding users to CCF."
    echo ""
    echo "usage: ./add_user.sh --cert-file string "
    echo ""
    echo "  --cert-file string     the certificate .pem file for the user"
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
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z "$cert_file" ]; then
	failed "Missing parameter --cert-file"
fi


echo "Looking for certificate file..."
certFile_exists=$(ls $cert_file 2>/dev/null || true)
if [ -z "$certFile_exists" ]; then
    echo "Cert file \"$cert_file\" does not exist."
    exit 0
fi

if [[ ${cert_file##*.} != "pem" ]]
then
    echo "Wrong file extension. Only \".pem\" files are supported."
    exit 0
fi

certs_folder=`dirname $cert_file`
proposal_json_file="${certs_folder}/set_user.json"

echo "Creating user json proposal file..."
create_user_proposal $cert_file $proposal_json_file

user_id=$(openssl x509 -in "$cert_file" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

echo "proposal json file created: $proposal_json_file"
echo "user id: $user_id"
