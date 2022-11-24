SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build

test: ## 🧪 Run tests, used for local development
	@echo -e "\e[34m$@\e[0m" || true
	@./scripts/run_test.sh

# Start hosting the application using `sandbox.sh` 
start-host: build ## 🏃 Start the CCF network using Sandbox.sh
	@echo -e "\e[34m$@\e[0m" || true
	@/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf dist

build-virtual: ## 📦 Build Virtual container image from Dockerfile
	@echo -e "\e[34m$@\e[0m" || true
	@../build_image.sh virtual

build-enclave: ## 📦 Build Enclave container image from Dockerfile
	@echo -e "\e[34m$@\e[0m" || true
	@../build_image.sh enclave

deploy: ## 📦 Deploy application to mCCF
	@echo -e "\e[34m Not Implemented \e[0m" || true

destroy: ## 📦 Destroy application
	@echo -e "\e[34m Not Implemented \e[0m" || true

e2e-test: ## 📦 Run end to end tests
	@echo -e "\e[34m Not Implemented \e[0m" || true
	