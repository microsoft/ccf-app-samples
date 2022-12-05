#!/bin/bash
set -euo pipefail

function usage {
    echo ""
    echo "Deploy the application to an environment."
    echo ""
    echo "usage: ./deploy.sh "
    echo ""
    echo ""
    exit 0
}

# parse parameters
if [ $# -eq 0 ]; then
    usage
    exit 1
fi