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


### Option2: New backend application

Create a new separate backend application that returns an OpenAPI documentation UI (swagger-UI), 

- The application can act as a wrapper on top of the CCF OpenAPI endpoint to retrieve the document, convert it to UI, and return the result, and it can be written in .NET, Node.js, or any other language.

- The application will generate a UI using a separate copy of the openAPI document defined within the application boundary (this document must be maintained alongside the endpoints).

## Decision

We will go with the first option because:
- It has the least development and maintenance effort.
- It will evolve and be updated automatically because it is leveraging a CCF built-in feature.

## Consequences

Developers will request [`$server/app/api`](https://microsoft.github.io/CCF/main/use_apps/rpc_api.html#get--app-api) to get the documentation of endpoints that require authentication with a valid user identity.
We need to support JWT authentication to allow endpoint testing through Swagger-UI because it does not support mutual TLS authentication (certificate base).
