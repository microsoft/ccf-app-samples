#!/bin/bash
set -euo pipefail

declare signing_cert=""
declare signing_key=""

function usage {
    echo ""
    echo "Open a network in mCCF and then run the tests."
    echo ""
    echo "usage: ./test_mccf.sh --address <ADDRESS> --signing-cert <CERT> --signing-key <CERT> [--interactive]"
    echo ""
    echo "  --address       string      The address of the primary CCF node"
    echo "  --signing-cert  string      The signing certificate (member0)"
    echo "  --signing-key   string      The signing key (member0)"
    echo "  --interactive   boolean     Optional. Run in Demo mode"
    echo ""
}

function failed {
    printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

# parse parameters

if [ $# -gt 7 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    case "$1" in
        --address) address="$2"; shift 2;;
        --signing-cert) signing_cert="$2"; shift 2;;
        --signing-key) signing_key="$2"; shift 2;;
        --interactive) interactive=1; shift;;
        --help) usage; exit 0;;
        *) usage; exit 1;;
    esac
done

# validate parameters
if [ -z "${signing_cert}" ]; then
    failed "You must supply --signing-cert"
fi
if [ -z "${signing_key}" ]; then
    failed "You must supply --signing-key"
fi
if [ -z "$address" ]; then
    failed "You must supply --address"
fi

# Base64 decode
export PUBLIC_CERT=$(echo "${signing_cert}" | base64 --decode)
export PRIVATE_CERT=$(echo "${signing_key}" | base64 --decode)
../scripts/test_mccf.sh --address "${address}" --signing-cert "${PUBLIC_CERT}" --signing-key "${PRIVATE_CERT}"