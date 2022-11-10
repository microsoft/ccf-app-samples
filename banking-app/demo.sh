#!/bin/bash
set -euox pipefail

# Run `make start-host` in another terminal before running this script
# To build and start a ccf network and automatically deploy your application on it.

# Change working directory to the one that contains 
# proposals, generated certs and keys, and constitution files
cd workspace/sandbox_common

# Run network governance script to add users to the network
# In this sample Members: represent the Banks, and Users are the customers
../.././demo_governance.sh

# Run application test scenario
../.././demo_application.sh
