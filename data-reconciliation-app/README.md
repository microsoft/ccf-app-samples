# CCF Data Reconciliation Application

This is the repo for _CCF Data Reconciliation - sample_.

## Overview

In the last few years, regulatory legislation has enforced a unique Legal Entity Identifier (LEI) which allows all financial industry participants to standardize how they reference counterparties and clients. This law has been the impetus for all financial industry participants to clean up their reference data and adopt this new identification system. It has been inefficient and expensive for industry participants to maintain reference data. These datasets are critical for trade processing, risk management and regulatory reporting and therefore a high degree of accuracy is required. Yet the only way to have certainty regarding their accuracy is constant review and refresh against authoritative sources of all data, an enormous and costly task.

Rather than collaborating with data providers and hiring human resources to keep these LEIs in sync, financial industry participants could leverage confidential compute platforms to create a consortium network and reconciliation service to clean up all their reference data. This would improve data quality in a compliant and cost-effective way through industry collaboration.

## Architecture

This is a work in progress overview of the current architecture and key interactions and integrations.

![architecture diagram](./docs/architecture.png)

## Getting Started

To get started run `make test` to run the application locally.

### Repo Layout

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

### Running Locally

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
