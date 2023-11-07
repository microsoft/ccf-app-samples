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
  - API Endpoint: allow members to add a role and allowed action.
  - API Endpoint: allow members to add a user and the role.
- Authorization
  - Check if a user exists and if an action is allowed.

### Repository Layout

```text
📂
└── src                 Application source code
|    └── auth           Member and User cert Authentication
│    └── endpoints      Application endpoints
│    └── repositories   Data repositories
│    └── services       Domain services
│    └── utils          utility classes

```

## Getting Started

To get started and run the application locally, start with setting up the environment.

```bash
# setup the environment
git clone https://github.com/microsoft/ccf-app-samples # Clone the samples repository
code ccf-app-samples                                   # open samples repository in Visual studio code

# In the VScode terminal window
cd decentralized-authz-app                             # Navigate to app folder
npm run build                                          # Build and create the application deployment bundle
```

## Local Deployment
