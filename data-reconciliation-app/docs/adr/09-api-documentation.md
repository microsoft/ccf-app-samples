# API Endpoints Documentation

## Context

We need to allow developer documentation, exploration and testing mechanisms for the application endpoints.

There are two options to achieve this objective:

- Use the built-in CCF OpenAPI documentation endpoint "$server/app/api" that returns an OpenAPI document in "JSON" format.
- A new backend application that returns an OpenAPI documentation UI (swagger-ui)


## Options

### Option1: CCF OpenAPI documentation endpoint

CCF exposes a built-in endpoint, [`$server/app/api`](https://microsoft.github.io/CCF/main/use_apps/rpc_api.html#get--app-api) to generate an OpenAPI document describing the currently installed endpoints. The document is compatible with OpenAPI version 3.0.0.

This document can be imported into [`https://editor.swagger.io/`](https://editor.swagger.io/) to generate a UI that allows developers to explore and test the application endpoints.

Currently CCF implementation is lacking the methodology for deploying the different options supported by OpenAPI as a part of application bundle `app.json`, like (info, schemes, securityDefinitions, host).


### Option2: New backend application

Create a new separate backend application that returns an OpenAPI documentation UI (swagger-ui), 

- the application can act as a wrapper on the top of CCF OpenAPI endpoint to get the document and convert it to UI and return result, this application could be (.NET - Nodejs - or any other type)

- or the application will depend on a separate copy of openAPI document, defined inside the application boundary and this document will be used to generate a UI (this document need to be maintained a long side with the endpoints )

## Decision

First option will be selected because
- It has the least development and maintenance effort
- As it is leveraging the built-in feature of CCF, it will evolve and be updated automatically.

## Consequences

Developers will request `$server/app/api` to get the documentation of endpoints that require authentication with a valid user identity.
We need to support JWT authentication to allow endpoint testing through Swagger-UI because it does not support mutual TLS authentication (certificate base).
