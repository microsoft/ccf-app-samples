SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build

test: start-host-for-test ## 🧪 Test the Banking Application in the sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@cd workspace/sandbox_common && ../../scripts/test.sh --serverIP 127.0.0.1:8000
	@. ./scripts/stop_sandbox.sh

# TODO: Currently a lot of the scripts have to be in the folder where
# the certificates are - I think this can be tidied up
test-docker-virtual: build-virtual ## 🧪 Test the Banking Application in a Docker sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@. ./scripts/start_docker.sh --virtual --serverIP 172.17.0.3
	@cd workspace/docker_certificates && ../../scripts/setup_governance.sh --serverIP 172.17.0.3:8080
	@cd workspace/docker_certificates && ../../scripts/test.sh --serverIP 172.17.0.3:8080
	@. ./scripts/stop_docker.sh --virtual

# TODO: Currently a lot of the scripts have to be in the folder where
# the certificates are - I think this can be tidied up
test-docker-enclave: build-enclave ## 🧪 Test the Banking Application in a Docker enclave
	@echo -e "\e[34m$@\e[0m" || true
	@. ./scripts/start_docker.sh --enclave --serverIP 172.17.0.4
	@cd workspace/docker_certificates && ../../scripts/setup_governance.sh --serverIP 172.17.0.4:8080
	@cd workspace/docker_certificates && ../../scripts/test.sh --serverIP 172.17.0.4:8080
	@. ./scripts/stop_docker.sh --enclave

# Run sandbox. Consider 3 members as 3 banks.
# This is used in the demo scripts
start-host: build ## 🏁 Start the CCF Sandbox for the demo
	@echo -e "\e[34m$@\e[0m" || true
	@/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0 --constitution-dir ./constitution

start-host-for-test: build ## 🏁 Start the CCF Sandbox for the test
	@echo -e "\e[34m$@\e[0m" || true
	@/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 2 --constitution-dir ./constitution > /dev/null 2>&1 &
	@echo "💤 Waiting for sandbox . . . "
	@sleep 15

demo: ## 🎬 Demo the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@./scripts/demo.sh
	@./scripts/show_app_log.sh

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

# We hardcode the IP so that we can set this in the cchost_config
# TODO: Move the cchost_config into the sample folder
run-virtual: ## 🏃 Start a virtual CCF node in Docker
	@echo -e "\e[34m$@\e[0m" || true
	@. ./scripts/start_docker.sh --virtual --serverIP 172.17.0.4

# We hardcode the IP so that we can set this in the cchost_config
# TODO: Move the cchost_config into the sample folder
run-enclave: ## 🏃 Start an enclave CCF node in Docker
	@echo -e "\e[34m$@\e[0m" || true
	@. ./scripts/start_docker.sh --enclave --serverIP 172.17.0.4

stop-virtual: ## ⛔ Stop a virtual CCF node in Docker
	@echo -e "\e[34m$@\e[0m" || true
	@. ./scripts/stop_docker.sh --virtual

stop-enclave: ## ⛔ Stop a virtual CCF node in Docker
	@echo -e "\e[34m$@\e[0m" || true
	@. ./scripts/stop_docker.sh --enclave
