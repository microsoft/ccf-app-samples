#!/bin/bash
set -euo pipefail

function usage {
    echo ""
    echo "Setup the CCF network using Azure Keyvault certificates."
    echo ""
    echo "usage: ./setup_governance.sh --nodeAddress <IPADDRESS:PORT> --certificate_dir <workspace/sandbox_common>"
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
        --certificate_dir) certs="$2"; shift;;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z $nodeAddress ]; then
    failed "You must supply --nodeAddress"
fi
if [ -z $certs ]; then
    failed "You must supply --certificate_dir"
fi


##############################################
# Generic variables
##############################################
app_dir=$PWD                    # application folder for reference
root_dir=`dirname $PWD`         # root (parent) folder 
server="https://${nodeAddress}" # ccf network address


##############################################
# Activate member 0
# . service_cert.pem was already copied to $certs
# . member0 cert/key was already copied to $certs
##############################################
echo "Getting list of members..."
curl $server/gov/members --cacert $certs/service_cert.pem | jq

curl "${server}/gov/ack/update_state_digest" \
    -X POST \
    --cacert $certs/service_cert.pem \
    --key $certs/member0_privk.pem \
    --cert $certs/member0_cert.pem \
    --silent | jq > $certs/activation.json

echo "Show digest"
cat $certs/activation.json

/opt/ccf/bin/scurl.sh "${server}/gov/ack" \
    --cacert $certs/service_cert.pem \
    --signing-key $certs/member0_privk.pem \
    --signing-cert $certs/member0_cert.pem \
    --header "Content-Type: application/json" \
    --data-binary @$certs/activation.json

echo "Getting list of members..."
curl ${server}/gov/members --cacert $certs/service_cert.pem | jq


##############################################
# Creating and adding members/users to network
##############################################

# create certificate files
create_certificate(){
    local certName="$1"
    local certsFolder="$2"
    cd $certsFolder
    /opt/ccf/bin/keygenerator.sh --name $certName --gen-enc-key
    cd -
}

#---------------------
echo "Adding Member 1/2: create certificate and proposal"
cert_name="member1"
create_certificate "${cert_name}" "${certs}"
$root_dir/scripts/add_member.sh --cert-file $certs/${cert_name}_cert.pem --pubk-file $certs/${cert_name}_enc_pubk.pem

echo "Adding Member 2/2: submit proposal to network and vote as accepted"
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file $certs/set_member.json --service-cert $certs/service_cert.pem \
  --signing-cert $certs/member0_cert.pem --signing-key $certs/member0_privk.pem


#---------------------
echo "Adding user0 1/2: create certificate and proposal"
cert_name="user0" 
create_certificate "${cert_name}" "${certs}"
$root_dir/scripts/add_user.sh --cert-file $certs/${cert_name}_cert.pem

echo "Adding user0 2/2: submit proposal to network and vote as accepted"
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file $certs/set_user.json --service-cert $certs/service_cert.pem \
  --signing-cert $certs/member0_cert.pem --signing-key $certs/member0_privk.pem


#---------------------
echo "Adding user1 1/2: create certificate and proposal"
cert_name="user1"
create_certificate "${cert_name}" "${certs}"
$root_dir/scripts/add_user.sh --cert-file $certs/${cert_name}_cert.pem

echo "Adding user1 2/2: submit proposal to network and vote as accepted"
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file $certs/set_user.json --service-cert $certs/service_cert.pem \
  --signing-cert $certs/member0_cert.pem --signing-key $certs/member0_privk.pem



##############################################
# Propose and Open Network
##############################################
create_open_network_proposal(){
    local certsFolder="$1"
    local service_cert=$(< ${certsFolder}/service_cert.pem sed '$!G' | paste -sd '\\n' -)

    local proposalFileName="${certsFolder}/network_open_proposal.json"
    cat <<JSON > $proposalFileName
{
  "actions": [
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

echo "Opening Network 1/2: create proposal"
create_open_network_proposal "${certs}"

echo "Opening Network 2/2: submit proposal to network and vote as accepted"
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file $certs/network_open_proposal.json --service-cert $certs/service_cert.pem \
  --signing-cert $certs/member0_cert.pem --signing-key $certs/member0_privk.pem

##############################################
# Test Network
##############################################
curl "${server}/node/network" --cacert $certs/service_cert.pem | jq

##############################################
# Propose application. The json file we use
# in the proposal is generated when we build
# the application as it has all the endpoints
# defined in it.
##############################################
echo "Proposing Application 1/1: submit proposal to network and vote as accepted"
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file ${app_dir}/dist/set_js_app.json $certs/network_open_proposal.json --service-cert $certs/service_cert.pem \
  --signing-cert $certs/member0_cert.pem --signing-key $certs/member0_privk.pem


