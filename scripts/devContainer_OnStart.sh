#!/bin/bash
set -euo pipefail

# This script is executed from the root of the repository.
npm install --prefix=banking-app
npm install --prefix=auditable-logging-app
npm install --prefix=data-reconciliation-app

# Create the JWT issuer config files for (Test - Microsoft Azure Identity Provider).
npm run create-jwt-config --prefix=data-reconciliation-app
