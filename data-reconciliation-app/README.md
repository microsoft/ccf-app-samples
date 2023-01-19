# CCF Data Reconciliation Application

This is the _CCF Data Reconciliation - sample_ in typescript.

## Overview

The CCF network will be used to host a reconciliation service where different parties with membership (banks and data providers) will be able to submit their own data to be reconciled against "each other's data" in a confidential manner without exposing the data to other members in the network.

When a new record(s) is submitted through ingestion endpoints, the application will search the key-value store by the record's key; if this key does not exist, it will be added; otherwise, a vote is added to this record with a member ID and the submitted value.

## Architecture

The reconciliation application consists of three main parts.

- Data ingestion
  - API Endpoint: allow members to submit their data to reconciled.
    - Accept single or batch of records
- Data reporting
  - API Endpoint: Members will query for results
    - Query by specific record by `a unique identifier`
    - Query all data
- Data reconciliation
  - Data is compared across all members, all members' data carry equal weight to reach consensus.
  - Reconciliation is on each record, not on the entire data set.

![architecture diagram](./docs/images/architecture.png)

### Repo Layout

```text
📂
├── docs                Sample application documentation
│   └── adrs            All Architecture decision records (ADR)
│
├── governance
│    └── constitution    CCF network constitution files
│    └── nodes           CCF network nodes configs
│    └── scripts         All governance scripts
│    └── vote            Contains proposal voting acceptance and rejection logic
│
└── src                 Application source code
│    └── endpoints      Application endpoints
│    └── models         Domain models
│    └── repositories   Data repositories
│    └── services       Domain services
│    └── utils          utility classes
│
└── test
     └── e2e-test       Application end to end tests
     └── unit-test      Application unit tests

```

## Getting Started

To get started and run the application locally.

```bash
git clone https://github.com/microsoft/ccf-app-samples # Clone the samples repository
code .                                                 # open samples repository in Visual studio code

# In the VScode terminal window
cd data-reconciliation-app                             # Navigate to reconciliation sample folder
make build                                             # Run interactive end to end tests
```

there several scenarios could be executed on the local environment

- **Run the application's [e2e-tests](./test/test.sh) in a sandbox environment**

  - `make test`

- **Run the application's [e2e-tests](./test/test.sh) in a sandbox environment with interactive mode**

  - `make demo`

- **Run the application's [e2e-tests](./test/test.sh) on a Docker container running a virtual environment (sandbox)**

  - `make test-docker-virtual`

- **Run the application [e2e-tests](./test/test.sh) on a managed ccf environment**

  - First, create a managed CCF instance on your Azure subscription. Please follow [here](https://github.com/microsoft/ccf-app-samples/tree/main/deploy#deploying-the-ccf-samples)
  - Run the e2e-test, please follow [here](https://github.com/microsoft/ccf-app-samples/tree/main/deploy#deploying-a-ccf-application-to-azure-managed-ccf)

- **Start a CCF network with three active members using the sandbox and deploy the application to it, the application and network are ready to receive requests**

  - `make start-host`

- **Run the application's unit tests**
  - `make unit-test`

These are the main scenarios; more commands are available at makefile and are described in the following section.

### Make file

A makefile provides a frontend to interacting with the project, this is used both locally and during CI and GitHub Actions. This makefile is self documenting, and has the following targets:

```text
help                 💬 This help message :)
build                🔨 Build the Application
build-virtual        📦 Build Virtual container image from Dockerfile
build-enclave        📦 Build Enclave container image from Dockerfile
start-host           🏃 Start the CCF network using Sandbox.sh
test                 🧪 Test the Data Reconciliation Application in the sandbox
test-docker-virtual  🧪 Test the Data Reconciliation Application in a Docker sandbox
test-docker-enclave  🧪 Test the Data Reconciliation Application in a Docker enclave
test-mccf            🧪 Test the Data Reconciliation Application in a Managed CCF environment
e2e-test             🧪 Run end to end tests
unit-test            🧪 Run the Application unit-test
demo                 🎬 Demo the Data Reconciliation Application
demo-code-change     🎬 Demo the Data Reconciliation Application Code Change
clean                🧹 Clean the working folders created during build/demo
```

## Testing

There are 3 different types of network that this sample can be tested against; Sandbox, Docker, and Managed CCF. The script [./test.sh](./test/test.sh) is specific to this sample and is called by wrapper scripts that exist in the root [scripts](../scripts/) folder. These wrapper scripts are used for all samples.

|     Network |                                                   Command |                                     Script |
| ----------: | --------------------------------------------------------: | -----------------------------------------: |
|     Sandbox |                                               `make test` | [test_sandbox](../scripts/test_sandbox.sh) |
|      Docker | `make test-docker-virtual` and `make test-docker-enclave` |   [test_docker](../scripts/test_docker.sh) |
| Managed CCF |                                          `make test-mccf` |     [test_mccf](../scripts/test_docker.sh) |

The wrapper scripts are responsible for starting the particular network with the correct constitution and setting up the governance (users/members/application). The wrapper scripts will also close the network after the tests have finished (excluding mCCF).

### Demo

It is also possible to run the tests in _Demo mode_. This can be achieved by running

```bash
cd data-reconciliation-app    # Navigate to reconciliation sample folder
make demo                     # Run interactive end to end tests
```

There is a [guide](./docs/demo-guidance.md) here explaining what the demo shows. This will run the tests but require manual intervention so you can inspect the state of the network.
