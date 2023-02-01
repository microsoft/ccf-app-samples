SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build
	@npm run create-jwt-config # Create the JWT issuer config files for (Test - Microsoft Azure Identity Provider).

build-virtual: build ## 📦 Build Virtual container image from Dockerfile
	@echo -e "\e[34m$@\e[0m" || true
	@../scripts/build_image.sh virtual

build-enclave: build ## 📦 Build Enclave container image from Dockerfile
	@echo -e "\e[34m$@\e[0m" || true
	@../scripts/build_image.sh enclave

# Start hosting the application using `sandbox.sh` and enable custom JWT authentication
start-host: build  ## 🏃 Start the CCF network using Sandbox.sh
	@echo -e "\e[34m$@\e[0m" || true
	@/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 1 --constitution-dir ./governance/constitution --jwt-issuer "./workspace/proposals/set_jwt_issuer_test_sandbox.json"

# Start hosting the application using `sandbox.sh` and enable MS IDP JWT authentication
start-host-jwt-ms: build ## 🏃 Start the CCF network using Sandbox.sh
	@echo -e "\e[34m$@\e[0m" || true
	@/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 1 --constitution-dir ./governance/constitution --jwt-issuer "./workspace/proposals/set_jwt_issuer_ms_sandbox.json"


test: build ## 🧪 Test the Data Reconciliation Application in the sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common --constitution_dir ./governance/constitution

test-docker-virtual: build-virtual ## 🧪 Test the Data Reconciliation Application in a Docker sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --virtual --serverIP 172.17.0.3 --port 8080

test-docker-enclave: build-enclave ## 🧪 Test the Data Reconciliation Application in a Docker enclave
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --enclave --serverIP 172.17.0.4 --port 8080

test-mccf: build ## 🧪 Test the Data Reconciliation Application in a Managed CCF environment
	@echo -e "\e[34m$@\e[0m" || true
	$(call check_defined, CCF_NAME)
	$(call check_defined, PUBLIC_CERT)
	$(call check_defined, PRIVATE_CERT)
	@. ../scripts/test_mccf.sh --address "${CCF_NAME}.confidential-ledger.azure.com" --signing-cert "${PUBLIC_CERT}" --signing-key "${PRIVATE_CERT}"

e2e-test: build ## 🧪 Run end to end tests
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common --constitution_dir ./governance/constitution
	
unit-test: ## 🧪 Run the Application unit-test
	@echo -e "\e[34m$@\e[0m" || true
	@npm run unit-test
	
demo: build ## 🎬 Demo the Data Reconciliation Application in the Sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common --constitution_dir ./governance/constitution --interactive

demo-docker: build-virtual ## 🎬 Demo the Data Reconciliation Application in a virtual Docker image
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --virtual --serverIP 172.17.0.3 --port 8080 --interactive

# This target is specifically for a demo in a pre-configured mCCF network running this application. It does not run without it
# 1. run `make demo`
# 2. make a code change to Line 72 - /workspaces/ccf-app-samples/data-reconciliation-app/src/models/data-schema.ts
# 3. Run this make target
demo-code-change: build ## 🎬 Demo the Data Reconciliation Application Code Change
	@echo -e "\e[34m$@\e[0m" || true
	$(call check_defined, CCF_NAME)
	@./test/code_change_demo.sh --address "${CCF_NAME}.confidential-ledger.azure.com" --interactive

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf dist

# Generate a MS-Idp AAD (Azure active directory) JWT (app-to-app) token for the application testing;
generate-jwt-token: # Generate an Azure AD access tokens for authentication
	@echo "########################################################################"
	@echo "## Generate a JWT token for the application; two applications must be registered in the Azure AD tenant"
	@echo "## Follow: https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app"
	@echo "# 1. Create the application that is used to generate the token (CCF api consumer) and generate the client certificate and secret"
	@echo "# 2. Create the application that is used to authenticate the token (the CCF API application) and expose the API"
	@echo "# 3. Replace client_id and client_secret with the values from the first application that is used to generate the token"
	@echo "# 4. Replace scope with the second application (Application ID URI) "
	@echo "# 5. Replace src/services/authentication-service.ts>"MS_APP_ID_URI" with the second application (Application ID URI) "
	@echo "########################################################################"
	@curl -X POST https://login.microsoftonline.com/16b3c013-d300-468d-ac64-7eda0820b6d3/oauth2/v2.0/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "client_id=${Client_Id}&client_secret=${Client_Secret}&scope=api://b8dbd573-a015-424b-b111-2d5fa11cee3c/.default&grant_type=client_credentials"