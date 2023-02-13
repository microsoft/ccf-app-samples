SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build

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
start-host-jwt-ms: build ## 🏃 Start the CCF network using Sandbox.sh using AAD
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

e2e-test: build ## 🧪 Test the Data Reconciliation Application in the sandbox (Typescript)
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common --constitution_dir ./governance/constitution --typescript

e2e-test-docker: build-virtual ## 🧪 Test the Data Reconciliation Application in a Docker sandbox (TypeScript)
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --virtual --serverIP 172.17.0.3 --port 8080 --typescript

unit-test: ## 🧪 Unit Test the Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run unit-test
	
demo: build ## 🎬 Demo the Data Reconciliation Application in the Sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common --constitution_dir ./governance/constitution --interactive

demo-docker: build-virtual ## 🎬 Demo the Data Reconciliation Application in a virtual Docker image
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --virtual --serverIP 172.17.0.3 --port 8080 --interactive

demo-mccf: build ## 🎬 Demo the Data Reconciliation Application in a Managed CCF environment
	@echo -e "\e[34m$@\e[0m" || true
	$(call check_defined, CCF_NAME)
	$(call check_defined, PUBLIC_CERT)
	$(call check_defined, PRIVATE_CERT)
	@. ../scripts/test_mccf.sh --address "${CCF_NAME}.confidential-ledger.azure.com" --signing-cert "${PUBLIC_CERT}" --signing-key "${PRIVATE_CERT}" --interactive

# This target is specifically for a demo in a pre-configured mCCF network running this application. It does not run without it
# 1. run `make demo`
# 2. make a code change to Line 72 - /workspaces/ccf-app-samples/data-reconciliation-app/src/models/data-schema.ts
# 3. Run this make target
demo-code-change: build ## 🎬 Demo the Data Reconciliation Application Code Change
	@echo -e "\e[34m$@\e[0m" || true
	$(call check_defined, CCF_NAME)
	@./test/code_change_demo.sh --address "${CCF_NAME}.confidential-ledger.azure.com" --interactive

deploy-app-to-sandbox: build ## 🚀 Deploy the Data Reconciliation Application to the sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/submit_proposal.sh --network-url "https://127.0.0.1:8000" --proposal-file ./dist/set_js_app.json --certificate_dir "./workspace/sandbox_common" --member-count 2
	@. ../scripts/submit_proposal.sh --network-url "https://127.0.0.1:8000" --proposal-file ./workspace/proposals/set_jwt_issuer_ms_proposal.json --certificate_dir "./workspace/sandbox_common" --member-count 2

deploy-app-to-mccf: build ## 🚀 Deploy the Data Reconciliation Application to Managed CCF
	@echo -e "\e[34m$@\e[0m" || true
	$(call check_defined, CCF_NAME)
	@. ../scripts/submit_proposal.sh --network-url "https://${CCF_NAME}.confidential-ledger.azure.com" --proposal-file ./dist/set_js_app.json --certificate_dir "./workspace/mccf_certificates" --member-count 2
	@. ../scripts/submit_proposal.sh --network-url "https://${CCF_NAME}.confidential-ledger.azure.com" --proposal-file ./workspace/proposals/set_jwt_issuer_ms_proposal.json --certificate_dir "./workspace/mccf_certificates" --member-count 2

# The following are here in case you forget to change directory!
deploy-mccf: ## 🚀 Deploy Managed CCF
	@cd .. && $(MAKE) deploy-mccf

deploy-ms-idp: ## 🔐 Create an Identity Provider
	@cd .. && $(MAKE) deploy-ms-idp

generate-access-token: ## 🔐 Generate and access token
	@cd .. && $(MAKE) generate-access-token

# Keep this at the bottom.
clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf dist
