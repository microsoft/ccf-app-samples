# API Endpoints Documentation

## Context

We need to allow developer documentation, exploration, and testing mechanisms for the application endpoints.

There are two options to achieve this objective:

- Use the built-in CCF OpenAPI documentation endpoint "$server/app/api" which returns an OpenAPI document in "JSON" format.
- A new backend application that returns an OpenAPI documentation UI (swagger-UI)


## Options

### Option1: CCF OpenAPI documentation endpoint

CCF exposes a built-in endpoint, [`$server/app/api`](https://microsoft.github.io/CCF/main/use_apps/rpc_api.html#get--app-api) to generate an OpenAPI document describing the currently installed endpoints. The document is compatible with OpenAPI version 3.0.0.

This document can be imported into [`Swagger`](https://editor.swagger.io/) to generate a UI that allows developers to explore and test the application endpoints.

Currently, CCF implementation lacks the methodology for deploying the different options supported by OpenAPI as a part of the application bundle `app.json`, like (info, schemes, security definitions, and host).

### Option2: New Swagger UI

Create two new endpoints as part of the application API
 - /app/swagger.json: return an OpenAPI documentation in json formate.
 - /app/swagger: return the html for swagger-ui which will a UI based on the OpenAPI documentation

Note: Currently, CCF `/app/api` OpenAPI documentation endpoint implementation lacks the methodology for deploying the different options supported by OpenAPI specifications as a part of the application bundle `app.json`, like (info, schemes, security definitions, and host), when the issues are solved, the `/app/swagger.json` will be replaced by the built-in ccf endpoint `/app/api`

## Decision

We will go with the second option because:
- Gives a better developer experience to document, explore and test the application endpoints.
- Will evolve and be updated automatically because it is part of the application.
- leverage the built-in features for swagger-ui like authentication using JWT or mutual TLS Certs 

## Consequences

- The application will have it is own OpenAPI document, which need to be update along side the app.json
- Developers will request [`$server/app/swagger`] to get swagger-ui for the application, they test
- The application endpoints can be tested using two typed of authentication
    - JWT Bearer tokens: using Microsoft Identity Provider (Idp) as token issuer
    - Mutual TLS authentication:

Developers will request [`$server/app/api`](https://microsoft.github.io/CCF/main/use_apps/rpc_api.html#get--app-api) to get the documentation of endpoints that require authentication with a valid user identity.
We need to support JWT authentication to allow endpoint testing through Swagger-UI because it does not support mutual TLS authentication (certificate base).
