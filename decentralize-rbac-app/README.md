# Decentralized RBAC Application

This is the _CCF Decentralized RBAC app - sample_ in typescript.

## Overview

The CCF network will be used to host a decentralized RBAC application where a consortium of members from different organizations would manage the roles, their allowed actions and users. A user is assigned a role which determines the allowed action.

An external service could use the application to perform authorization(AuthZ) decisions for the logged-in user.

## Architecture

The application consists of three parts:

(i) Role management,
(ii) User management, and,
(iii) Authorization

- Role and User Management
  - `PUT /{role}/roles/{action}`: Add a permitted action for a given role. Requires member cert auth.
  - `PUT /{user_id}/users/{role}`: Assign a specific role to a given user. Requires member cert auth.
- Authorization
  - `GET /{user_id}/action/{actionName}` - Check whether a user is permitted to make a given action. Requires user cert auth.

### Repository Layout

```text
📂
└── src                 Application source code
|    └── auth           Member and User cert Authentication
│    └── endpoints      Application endpoints
│    └── repositories   Data repositories
│    └── services       Domain services
│    └── utils          utility classes
└── test                end-to-end tests
└── docker              Contains the Dockerfile to build the virtual and enclave image
└── governance
    └── constitution    Default constitution used for the tests
    └── nodes           Config file for the virtual and enclave sandbox deployment
    └── scripts         Scripts to generate member and user certs for running tests
    └── vote            A json file that contains the vote body to accept proposals

```

## Getting Started

To get started and run the application locally, start with setting up the environment.

```bash
# setup the environment
git clone https://github.com/microsoft/ccf-app-samples # Clone the samples repository
code ccf-app-samples                                   # open samples repository in Visual studio code

# In the VScode terminal window
cd decentralized-authz-app                          # Navigate to app folder
make build                                          # Build and create the application deployment bundle
```

Now the environment is ready, and there are several scenarios that could be executed at this stage.

- **Run the application's [e2e-tests](./test/test.sh) in a sandbox (simulated) environment**

  - `make test`

- **Run the application's [e2e-tests](./test/test.sh) on a Docker Container running a virtual (simulated) environment**

  - `make test-docker-virtual`

- **Start a CCF network with 1 active member and 2 users using the sandbox and deploy the application to it, the application and network are ready to receive requests**

  - `make start-host`

These are the main scenarios; more commands are defined in `Makefile` and are described in the following section.

### Make file

A Makefile provides a front-end to interact with the project. It is used both locally, during CI, and on GitHub Actions. This Makefile is self-documented, and has the following targets:

```text
help                 💬 This help message :)
build                🔨 Build the decentralized-rbac Application
build-virtual        📦 Build Virtual container image from Dockerfile
build-enclave        📦 Build Enclave container image from Dockerfile
test                 🧪 Test the decentralized-rbac Application in the sandbox
test-docker-virtual  🧪 Test the decentralized-rbac Application in a Docker sandbox
test-docker-enclave  🧪 Test the decentralized-rbac Application in a Docker enclave
start-host           🏁 Start the CCF Sandbox for the demo
clean                🧹 Clean the working folders created during build/demo
```

## Testing

```bash
cd decentralize-rbac-app      # Navigate to RBAC sample folder
make test                     # Run the end-to-end(e2e) tests
```
