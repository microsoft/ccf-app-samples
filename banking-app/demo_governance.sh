#!/bin/bash
set -euox pipefail

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

# create user0 certificate
create_certificate user0

# create user1 certificate
create_certificate user1

# copy vote response file
cp ../../vote/* ./

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


# "Display network ccf version"
curl "https://127.0.0.1:8000/node/version" --cacert service_cert.pem

# "Display network details"
curl "https://127.0.0.1:8000/node/network" --cacert service_cert.pem

# "Display network nodes details"
curl "https://127.0.0.1:8000/node/network/nodes" --cacert service_cert.pem

# "Display network members details"
curl "https://127.0.0.1:8000/gov/members" --cacert service_cert.pem
