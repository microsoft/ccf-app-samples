SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 🔨 Build the Logging Application
	@echo -e "\e[34m$@\e[0m" || true
	@npm run build

test: build ## 🧪 Test the Logging Application
	@echo -e "\e[34m$@\e[0m" || true
	@. ../scripts/test_sandbox.sh --nodeAddress 127.0.0.1:8000 --certificate_dir ./workspace/sandbox_common --constitution_dir ./constitution

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf dist
