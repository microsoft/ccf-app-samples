#!/bin/bash
set -euo pipefail

# This script is executed from the root of the repository.
npm install --prefix=banking-app
npm install --prefix=auditable-logging-app
npm install --prefix=data-reconciliation-app

# Install PowerShell modules
pwsh -Command "Install-Module -Name Az.Resources -AllowClobber -Force"

# Install Bicep
curl -Lo bicep https://github.com/Azure/bicep/releases/latest/download/bicep-linux-x64
chmod +x ./bicep
sudo mv ./bicep /usr/local/bin/bicep
