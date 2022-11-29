#!/bin/bash
set -euo pipefail

# Run `make start-host` in another terminal before running this script
# To build and start a ccf network and automatically deploy your application on it.

declare server="https://127.0.0.1:8000"
declare certificate_dir=workspace/sandbox_common

# Using the same way as https://github.com/microsoft/CCF/blob/1f26340dea89c06cf615cbd4ec1b32665840ef4e/tests/start_network.py#L94
# There is a side effect here in the case of the sandbox as it creates the 'workspace/sandbox_common' everytime
# it starts up. The following condition not only checks that this pem file has been created, it also checks it
# is valid. Don't be caught out by the folder existing from a previous run.
if [ "200" != "$(curl $server/node/network -k -s -o /dev/null -w %{http_code})" ]; then
    echo "💥 Have you started the sandbox?"
    exit 1
fi

# Change working directory to the one that contains 
# proposals, generated certs and keys, and constitution files
cd ${certificate_dir}

# Run network governance script to add users to the network
# In this sample Members: represent the Banks, and Users are the customers
echo -e "\n\e[34m <--Run governance demo--> \e[0m\n"
../../scripts/demo_governance.sh

# Run application test scenario
echo -e "\n\n\e[34m <--Run the application's endpoints access demo--> \e[0m\n"
../../scripts/demo_application.sh
