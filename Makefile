SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-23s\033[0m %s\n", $$1, $$2}'

lint: ## 🔍 Lint the code base (but don't fix)
	@echo -e "\e[34m$@\e[0m" || true
	@./scripts/lint.sh

lint-fix: ## 🌟 Lint and fix the code base
	@echo -e "\e[34m$@\e[0m" || true
	@./scripts/lint.sh -f

build: ## 🔨 Build an Application
	@echo -e "\e[34mPlease change directory to the sample you wish to build.\e[0m" || true

test: ## 🧪 Test an Application
	@echo -e "\e[34mPlease change directory to the sample you wish to test.\e[0m" || true

start-host: build ## 🏃 Start the CCF Sandbox
	@echo -e "\e[34mPlease change directory to the sample you wish to start.\e[0m" || true

demo: ## 🎬 Demo an Application
	@echo -e "\e[34mPlease change directory to the sample you wish to demo.\e[0m" || true

deploy-mccf: ## 🚀 Deploy Managed CCF
	@echo -e "\e[34m$@\e[0m" || true
	@cd deploy && /opt/ccf_virtual/bin/keygenerator.sh --name member0
	@cd deploy && pwsh ./New-ManagedCCF.ps1 -PEMFilename member0_cert.pem

deploy-ms-idp: ## 🔐 Create an Identity Provider
	@echo -e "\e[34m$@\e[0m" || true
	cd deploy && pwsh ./New-IdentityProvider.ps1

generate-access-token: ## 🔐 Generate an access token
	@echo -e "\e[34m$@\e[0m" || true
	./scripts/generate_access_token.sh

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
