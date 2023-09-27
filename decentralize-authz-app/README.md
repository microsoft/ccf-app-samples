# Decentralized AuthZ application

This is the _CCF Decentralized AuthZ app - sample_ in typescript.

## Overview

The CCF network will be used to host a decentralized authorization service where different parties with membership (insurance providers, physicians and hospitals) will be able to manage the users and their roles for a shared healthcare services portal. A portal user could belong to one or more organizations (a hospital, an insurance provider or a physicians practice) and have a specific role in each organization. A user's organization and role is collectively called a Claim. 

## Architecture

The reconciliation application consists of two parts: User Management and Authorization.

- User Management
  - API Endpoint: allow members to add a user or remove a user.
- Authorization
  - Check if a user exist and get the claims.

### Repository Layout

```text
📂
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
code ccf-app-samples                                   # open samples repository in Visual studio code

# In the VScode terminal window
cd decentralized-authz-app                             # Navigate to app folder
make build                                             # Build and create the application deployment bundle
```

## Local Deployment
