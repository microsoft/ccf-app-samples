#!/bin/bash
set -euo pipefail

./devContainer_OnStart.sh

# Create the JWT issuer config files for (Test - Microsoft Azure Identity Provider).
npm run create-jwt-config --prefix=data-reconciliation-app
