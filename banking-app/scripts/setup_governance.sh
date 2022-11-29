#!/bin/bash
set -euo pipefail

function usage {
    echo ""
    echo "Setup the CCF network."
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
        --certificate_dir) certificate_dir="$2"; shift;;
        --help) usage; exit 0;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [ -z $nodeAddress ]; then
    failed "You must supply --nodeAddress"
fi
if [ -z $certificate_dir ]; then
    failed "You must supply --certificate_dir"
fi
server="https://${nodeAddress}"

echo "📂 Working directory (for certificates): ${certificate_dir}"
cd ${certificate_dir}

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
# Propose users and Open Network
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

######
# Vote
######
echo "Network Proposal ID: $network_proposal_out_id"
/opt/ccf/bin/scurl.sh "${server}/gov/proposals/$network_proposal_out_id/ballots" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @../../vote/vote_accept.json \
    -H "content-type: application/json" | jq

##############################################
# Propose application. The json file we use
# in the proposal is generated when we build
# the application as it has all the endpoints
# defined in it.
##############################################
application_proposal_out=$(/opt/ccf/bin/scurl.sh "${server}/gov/proposals" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @../../dist/set_js_app.json \
    -H "content-type: application/json")
application_proposal_out_id=$( jq -r  '.proposal_id' <<< "${application_proposal_out}" )

######
# Vote
######
echo "Application Proposal ID: ${application_proposal_out_id}"
/opt/ccf/bin/scurl.sh "${server}/gov/proposals/${application_proposal_out_id}/ballots" \
    --cacert service_cert.pem \
    --signing-key member0_privk.pem \
    --signing-cert member0_cert.pem \
    --data-binary @../../vote/vote_accept.json \
    -H "content-type: application/json" | jq

##############################################
# Test Network
##############################################
curl "${server}/node/network" --cacert service_cert.pem | jq
