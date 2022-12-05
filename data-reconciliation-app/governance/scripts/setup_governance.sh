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


##############################################
# Generic variables
##############################################
app_dir=$PWD                    # application folder for reference
root_dir=`dirname $PWD`         # root (parent) folder 
app_name=${app_dir##*/}        # application name (to be used in container)
server="https://${nodeAddress}" # ccf network address
vault_name="kv-ccf-neutrino-vault"


echo "📂 Working directory (for certificates): ${certificate_dir}"
cd ${certificate_dir}

##############################################
# Activate member 0
# . service_cert.pem was already copied to $certificate_dir
# . member0 cert/key was already copied to $certificate_dir
##############################################
echo "Getting list of members..."
curl $server/gov/members --cacert service_cert.pem | jq

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
curl ${server}/gov/members --cacert service_cert.pem | jq


##############################################
# Creating and adding members/users to network
##############################################

# create/retrieve certificate files from KV
create_certificate(){
    local certName="$1"

    # generate certs/keys in Azure KV (nothing is done if already existent)
    $app_dir/scripts/generate_keys.sh \
      --cert-name $certName --vault-name $vault_name --policy $app_dir/scripts/identity_cert_policy.json

    # retrieve certs/keys from Azure KV
    $app_dir/scripts/retrieve_keys.sh \
      --cert-name certName --vault-name $vault_name
}

# Adding Member: create certificate and proposal
cert_name="member1"
create_certificate "${cert_name}"
$root_dir/scripts/add_member.sh --cert-file ${cert_name}_cert.pem --pub-file ${cert_name}-enc_pubk.pem

# Adding Member: submit proposal to network and vote as accepted
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file set_member.json --service-cert service_cert.pem \
  --signing-cert member0_cert.pem --signing-key member0_privk.pem


# Adding user0: create certificate and proposal
cert_name="user0"
create_certificate "${cert_name}"
$root_dir/scripts/add_user.sh --cert-file ${cert_name}_cert.pem --pub-file ${cert_name}-enc_pubk.pem

# Adding user0: submit proposal to network and vote as accepted
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file set_user.json --service-cert service_cert.pem \
  --signing-cert member0_cert.pem --signing-key member0_privk.pem


# generate json proposal
cert_name="user1"
create_certificate "${cert_name}"
$root_dir/scripts/add_user.sh --cert-file ${cert_name}_cert.pem --pub-file ${cert_name}-enc_pubk.pem

# submit user proposal to network and vote as accepted
$root_dir/scripts/submit_proposal.sh --network-url  ${server} \
  --proposal-file set_user.json --service-cert service_cert.pem \
  --signing-cert member0_cert.pem --signing-key member0_privk.pem


# Prepare a test network by adding a member 
# and two users to the network, and then open it
create_test_network_proposal(){
    local service_cert=$(< service_cert.pem sed '$!G' | paste -sd '\\n' -)

    local proposalFileName="network_open_proposal.json"
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
