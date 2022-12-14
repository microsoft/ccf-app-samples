SHELL := /bin/bash

.PHONY: help
.DEFAULT_GOAL := help

help: ## ๐ฌ This help message :)
	@grep -E '[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## ๐ Lint the code base (but don't fix)
	@echo -e "\e[34m$@\e[0m" || true
	@./scripts/lint.sh

lint-fix: ## ๐ Lint and fix the code base
	@echo -e "\e[34m$@\e[0m" || true
	@./scripts/lint.sh -f

build: ## ๐จ Build an Application
	@echo -e "\e[34mPlease change directory to the sample you wish to build.\e[0m" || true

test: ## ๐งช Test an Application
	@echo -e "\e[34mPlease change directory to the sample you wish to test.\e[0m" || true

start-host: build ## ๐ Start the CCF Sandbox
	@echo -e "\e[34mPlease change directory to the sample you wish to start.\e[0m" || true

demo: ## ๐ฌ Demo an Application
	@echo -e "\e[34mPlease change directory to the sample you wish to demo.\e[0m" || true

clean: ## ๐งน Clean the working folders created during build/demo
	@rm -rf .venv_ccf_sandbox
	@rm -rf workspace
