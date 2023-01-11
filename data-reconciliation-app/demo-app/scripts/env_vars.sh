#!/bin/bash

certs="./workspace/sandbox_common"
server="https://127.0.0.1:8000"
ingestUrl="$server/app/ingest"
reportUrl="$server/app/report"
proposalUrl="$server/gov/proposals"
only_status_code="-s -o /dev/null -w %{http_code}"
id="9845001D460PEJE54159"
id1="984500E1B2CA1D4EKG67"
id2="984500BA57A56NBD3A24"
id3="9845001D460PEJE54159"

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

function addCheckpoint {
    printf "%s\n\n" "${1}"
    read -n1 -r -p "- Press any key to continue..."
    printf "\n"
}