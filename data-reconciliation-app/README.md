# CCF Data Reconciliation Application

This is the _CCF Data Reconciliation - sample_ in typescript.

## Overview

The CCF network will be used to host a reconciliation service where different parties with membership (banks and data providers) will be able to submit their own data to be reconciled against "each other's data" in a confidential manner without exposing the data to other members in the network.

When a new record(s) is submitted through ingestion endpoints, the application will search the key-value store by the record's key; if this key does not exist, it will be added; otherwise, a vote is added to this record with a member ID and the submitted value.

## Architecture

The reconciliation application consists of three main parts: Data Ingestion, Data Reconciliation and Data Reporting.

- Data ingestion
  - API Endpoint: allow members to submit their data to reconciled.
    - Accept single or batch of records
- Data reconciliation
  - Data is compared across all members, all members' data carry equal weight to reach consensus.
  - Reconciliation is on each record, not on the entire data set.
- Data reporting
  - API Endpoint: Members will query for results
    - Query by specific record by `a unique identifier`
    - Query all data

![architecture diagram](./docs/images/architecture.png)

### Repository Layout

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
     └── data-samples    Data files for tests|demo
     └── e2e-test            Application end to end tests
     └── unit-test            Application unit tests
     

```

## Getting Started

To get started and run the application locally, start with setting up the environment.

```bash
# setup the environment
git clone https://github.com/microsoft/ccf-app-samples # Clone the samples repository
code ccf-app-samples                                                 # open samples repository in Visual studio code

# In the VScode terminal window
cd data-reconciliation-app                             # Navigate to reconciliation sample folder
make build                                             # Build and create the application deployment bundle
```

Now the environment is ready, and there are several scenarios that could be executed at this stage.

- **Run the application's [e2e-tests](./test/test.sh) in a sandbox environment in the interactive mode**
  - `make demo`

- **Run the application's [e2e-tests](./test/test.sh) in a sandbox (simulated) environment**
  - `make test`

- **Run the application's [e2e-tests](./test/test.sh) on a Docker Container running a virtual (simulated) environment**
  - `make test-docker-virtual`

- **Run the application [e2e-tests](./test/test.sh) on a Managed CCF environment**
  - First, create a Managed CCF instance on your Azure subscription. Please follow [here](https://github.com/microsoft/ccf-app-samples/tree/main/deploy#deploying-the-ccf-samples)
  - Run the e2e-test, please follow [here](https://github.com/microsoft/ccf-app-samples/tree/main/deploy#deploying-a-ccf-application-to-azure-managed-ccf)

- **Start a CCF network with 3 active members and 1 user using the sandbox and deploy the application to it, the application and network are ready to receive requests**
  - `make start-host`

- **Run the application's unit tests**
  - `make unit-test`

These are the main scenarios; more commands are available at makefile and are described in the following section.

### Make file

A Makefile provides a front-end to interact with the project. It is used both locally, during CI, and on GitHub Actions. This Makefile is self-documented, and has the following targets:

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

The application testing strategy depends on two main types of testing to maintain code quality and coverage:

- Unit testing: to test the application’s business logic (domain models and services), please follow [here](./test/README.md#unit-testing)
- End to end testing: to test application’s workflows from beginning to end, please follow [here](./test/README.md#end-to-end-testing)

```bash
cd data-reconciliation-app    # Navigate to reconciliation sample folder
make unit-test                # Run the unit tests
make test                     # Run the end-to-end(e2e) tests 
```

### Demo

It is also possible to run the tests in _Demo mode_. This can be achieved by running

```bash
cd data-reconciliation-app    # Navigate to reconciliation sample folder
make demo                     # Run interactive end-to-end(e2e) tests
```

There is a [guide](./docs/demo-guidance.md) here explaining what the demo shows. This will run the tests but require manual intervention so you can inspect the state of the network.
