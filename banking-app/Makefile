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

# Hack to use default resolve.js
# It should be improved after '--no-default-constitution' is added to sandbox.sh.
# NOTE: This hack replaces the content of /opt/ccf/bin/resolve.js
# Run sandbox. Consider 3 members as 3 banks.
start-host: build ## 🏃 Start the CCF Sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@cp constitutions/resolve.js /opt/ccf/bin/resolve.js
	@/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0

demo: ## 🎬 Demo the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@./demo.sh
	@./show_app_log.sh

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf dist
