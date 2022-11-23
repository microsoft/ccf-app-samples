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

clean: ## 🧹 Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
	@rm -rf dist
