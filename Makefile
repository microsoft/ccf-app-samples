SHELL := /bin/bash

.PHONY: help prepare-demo
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## 🌟 Lint the code base
	@echo -e "\e[34m$@\e[0m" || true
	@./lint.sh

build: ## 🔨 Build the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@cd banking-app && npm run build

test: ## 🧪 Test the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@cd banking-app && ./test.sh

start-host: build ## 🏃 Start the CCF Sandbox
	@echo -e "\e[34m$@\e[0m" || true
	@cd banking-app && /opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0

prepare-demo: ## 🚀 Prepare the banking application demo
	@echo -e "\e[34m$@\e[0m" || true
	@cd banking-app && ./prepare_demo.sh

demo: ## 🎬 Demo the Banking Application
	@echo -e "\e[34m$@\e[0m" || true
	@cd banking-app && ./demo.sh
	@cd banking-app && ./show_app_log.sh

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf banking-app/.venv_ccf_sandbox
	@rm -rf banking-app/dist
	@rm -rf banking-app/workspace
