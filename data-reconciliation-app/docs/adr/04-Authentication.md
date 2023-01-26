# API Authentication

## Context

We need to authenticate members and users who are going to use the API endpoints and use their unique identifier to mark their data in our data store.

CCF provides native support for two common user authentication schemes:

- JWT Authentication
- Certificate Authentication

## Roles and Responsibilities

In CCF, Members are capable of performing governance actions, whereas Users can only interact with the application endpoints.

In the Data-Reconciliation Application, Members can also interact with the application endpoints. From an application perspective, Members and Users have the same roles (both are capable of ingesting and reporting data, and there is no distinction between them). For governance actions related to the Data-Reconciliation App (submitting and voting on proposals), again, only members will be able to interact with the governance-specific endpoints.


## Options

### Option1: Certificate Authentication

Users and members are identified in CCF using X.509 certificates. They can be added or removed via governance proposals, which are subject to the consortium constitution rules.

Requests sent by users can be authenticated in one of two ways:

- Using the TLS handshake, in which a client proves its identity by using the user's private key (for example, with curl's --key and --cert arguments).
- By [Signing](https://microsoft.github.io/CCF/main/use_apps/issue_commands.html#signing) the request content with the user's private key, as described [here](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-12).

A unique certificate digest is generated from the certificate to act as the member's or user's unique identifier.

### Option2: JWT Authentication

JWT (JSON Web Token) bearer authentication allows to use an external identity provider (IdP) such as the Microsoft Identity Platform for user authentication in CCF.

Once the user has acquired a token from an IdP supported by the app, they can include it in HTTP requests in the Authorization header as a bearer token. The CCF app validates the token and can then use the user's identity and other claims embedded in the token.

CCF provides support for managing public token signing keys required for validating tokens. In the future, CCF will support validating token signatures natively (currently the responsibility of apps).

## Decision

We will go with **Certificate Authentication** implementation for the following reasons:

- Effectively saves time and effort because we already have a sample implementation in the banking app.
- The least reliant on external components, which will keep our sample simple (no need for an identity provider to issue and validate tokens)
- No UI implementation is planned for the current phase. (later, if we're going to create a UI, it is better to go with **JWT Authentication**)

## Consequences

Implementing an authentication service based on CCF certificate authentication to identify users and members on each request.

## Resource

[CCF Certificate Authentication](https://microsoft.github.io/CCF/main/build_apps/auth/cert.html)
[CCF JWT Authentication](https://microsoft.github.io/CCF/main/build_apps/auth/jwt.html)
