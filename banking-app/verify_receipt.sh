#!/bin/bash

# Input: Takes response body of banking-app's /app/receipt from stdin.
# Output: When the verification is successful, it writes "OK" to stdout. Otherwise it writes "Verify failed" to stderr and results in an exit code of 1.

cd "$(dirname "$0")"

set -e

VENV_DIR=${VENV_DIR:-.venv_ccf_verify_receipt}

if [ ! -f "${VENV_DIR}/bin/activate" ]; then
    python3.8 -m venv "${VENV_DIR}"
fi

source "${VENV_DIR}"/bin/activate
pip install --quiet --upgrade pip ccf

python verify_receipt.py <&0
