# Decentralized AuthZ application

This is the _CCF Decentralized AuthZ app - sample_ in typescript.

## Overview

The CCF network will be used to host a decentralized RBAC application where a consortium of members from different organizations would manage the roles, allowed action for a role and users. A user would have a specific role that would determine the allowed action. 

A service could use the decentralized RBAC application to determine if an action is allowed for a logged-in user. 

## Architecture

The application consists of two parts: Role and User Management, Authorization.

- Role and User Management
  - API Endpoint: allow members to add a role and action allowed for a role.
  - API Endpoint: allow members to add a user and their role.
- Authorization
  - Check if a user exist and an action is allowed.

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
