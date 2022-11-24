SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build

test: ## 🧪 Test the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@./test.sh

# Run sandbox. Consider 3 members as 3 banks.
# There is a fix to the sandbox.sh that will come as part of v3
# Until then the following cannot be used.
#	@/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0 --constitution-path ./constitution
# This means we have to copy the constitution over the top of /opt/ccf/bin
start-host: build ## 🏁 Start the CCF Sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@cp ./constitution/*.js /opt/ccf/bin/
	@/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0

demo: ## 🎬 Demo the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@./demo.sh
	@./show_app_log.sh

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

run-virtual: ## 🏃 Start a virtual CCF node in Docker
	@echo -e "\e[34m$@\e[0m" || true
	@docker run --detach --ip 172.17.0.4 banking-app:virtual

stop-virtual: ## ⛔ Stop a virtual CCF node in Docker
	@echo -e "\e[34m$@\e[0m" || true
	@{ \
	containerId=$$(docker ps -qf ancestor=banking-app:virtual) ;\
	docker stop $$containerId ;\
	}
