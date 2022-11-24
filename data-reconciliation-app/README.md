# CCF Data Reconciliation Application

This is the repo for _CCF Data Reconciliation - sample_.

## Architecture

This is a work in progress overview of the current architecture and key interactions and integrations.

![architecture diagram](./docs/architecture.png)

## Repo Layout

```text
📂
├── docs                Main project docs
│   └── adrs            All Architecture design records (ADR)
│
├── governance
│   └── constitutions   CCF network constitutions files
│   └── vote            Contains proposal voting acceptance and rejection logic
│   └── scripts         All governance scripts
│
└── scripts             All the scripts to test, demo and deploy the application
└── src                 Application source code
    └── endpoints       Application endpoints implementation
```

## Running Locally

A makefile provides a frontend to interacting with the project, this is used both locally and during CI and GitHub Actions. This makefile is self documentating, and has the following targets:

```text
help                 💬 This help message :)
lint                 🌟 Lint & format, will not fix but sets exit code on error, use in CI
lint-fix             🔍 Lint & format, try to fix & update code, run locally
build                🔨 Build the Application
test                 🧪 Run tests, used for local development
start-host           🏃 Start the CCF network
demo                 🎬 Demo the Data Reconciliation Application
clean                🧹 Clean up local files
```

To get started run `make test` to run the application locally.
