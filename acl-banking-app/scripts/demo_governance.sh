#!/bin/bash
set -euox pipefail

declare server="https://127.0.0.1:8000"

ccf_prefix=/opt/ccf_virtual/bin

create_certificate(){
    local certName="$1"
    local certFile="${1}_cert.pem"
    local setUserFile="set_${1}.json"
    $ccf_prefix/keygenerator.sh --name $certName

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
proposal0_out=$(ccf_cose_sign1 --ccf-gov-msg-type proposal \
  --ccf-gov-msg-created_at `date -uIs` \
  --signing-key member0_privk.pem \
  --signing-cert member0_cert.pem \
  --content set_user0.json | \
  curl -s "${server}/gov/proposals" \
  --cacert service_cert.pem \
  --data-binary @- \
  -H "content-type: application/cose")
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
echo $proposal0_id

# Vote by member 1
ccf_cose_sign1 --ccf-gov-msg-type ballot \
  --ccf-gov-msg-proposal_id $proposal0_id \
  --ccf-gov-msg-created_at `date -uIs` \
  --signing-key member1_privk.pem \
  --signing-cert member1_cert.pem \
  --content vote_accept.json | \
  curl -s "${server}/gov/proposals/$proposal0_id/ballots" \
  --cacert service_cert.pem \
  --data-binary @- \
  -H "content-type: application/cose" | jq

# Vote by member 2
ccf_cose_sign1 --ccf-gov-msg-type ballot \
  --ccf-gov-msg-proposal_id $proposal0_id \
  --ccf-gov-msg-created_at `date -uIs` \
  --signing-key member2_privk.pem \
  --signing-cert member2_cert.pem \
  --content vote_accept.json | \
  curl -s "${server}/gov/proposals/$proposal0_id/ballots" \
  --cacert service_cert.pem \
  --data-binary @- \
  -H "content-type: application/cose" | jq

# Proposal for user1
proposal1_out=$(ccf_cose_sign1 --ccf-gov-msg-type proposal \
  --ccf-gov-msg-created_at `date -uIs` \
  --signing-key member0_privk.pem \
  --signing-cert member0_cert.pem \
  --content set_user1.json | \
  curl -s "${server}/gov/proposals" \
  --cacert service_cert.pem \
  --data-binary @- \
  -H "content-type: application/cose")
proposal1_id=$( jq -r  '.proposal_id' <<< "${proposal1_out}" )
echo $proposal1_id

# Vote by member 1
ccf_cose_sign1 --ccf-gov-msg-type ballot \
  --ccf-gov-msg-proposal_id $proposal1_id \
  --ccf-gov-msg-created_at `date -uIs` \
  --signing-key member1_privk.pem \
  --signing-cert member1_cert.pem \
  --content vote_accept.json | \
  curl -s "${server}/gov/proposals/$proposal1_id/ballots" \
  --cacert service_cert.pem \
  --data-binary @- \
  -H "content-type: application/cose" | jq

# Vote by member 2
ccf_cose_sign1 --ccf-gov-msg-type ballot \
  --ccf-gov-msg-proposal_id $proposal1_id \
  --ccf-gov-msg-created_at `date -uIs` \
  --signing-key member2_privk.pem \
  --signing-cert member2_cert.pem \
  --content vote_accept.json | \
  curl -s "${server}/gov/proposals/$proposal1_id/ballots" \
  --cacert service_cert.pem \
  --data-binary @- \
  -H "content-type: application/cose" | jq

# "Display network ccf version"
curl "${server}/node/version" --cacert service_cert.pem

# "Display network details"
curl "${server}/node/network" --cacert service_cert.pem

# "Display network nodes details"
curl "${server}/node/network/nodes" --cacert service_cert.pem

# "Display network members details"
curl "${server}/gov/members" --cacert service_cert.pem
