SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

check_defined = \
    $(strip $(foreach 1,$1, \
        $(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
    $(if $(value $1),, \
      $(error Undefined $1$(if $2, ($2))))

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the decentralized-rbac Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build

build-virtual: build ## 📦 Build Virtual container image from Dockerfile
	@echo -e "\e[34m$@\e[0m" || true
	@../scripts/build_image.sh virtual

build-enclave: build ## 📦 Build Enclave container image from Dockerfile
	@echo -e "\e[34m$@\e[0m" || true
	@../scripts/build_image.sh enclave

test: build ## 🧪 Test the decentralized-rbac Application in the sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common  --constitution_dir ./governance/constitution

test-docker-virtual: build-virtual ## 🧪 Test the decentralized-rbac Application in a Docker sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --virtual --serverIP 127.0.0.1 --port 8080

test-docker-enclave: build-enclave ## 🧪 Test the decentralized-rbac Application in a Docker enclave
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_docker.sh --enclave --serverIP 127.0.0.1 --port 8080

# Run sandbox. 
# This is used in the demo scripts
start-host: build ## 🏁 Start the CCF Sandbox for the demo
	@echo -e "\e[34m$@\e[0m" || true
	@/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 1 --initial-user-count 2 --constitution-dir ./governance/constitution

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf .venv_ccf_verify_receipt
	@rm -rf workspace
	@rm -rf dist
