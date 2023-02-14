# Secure Swagger Endpoint

## Context

We allow developer documentation, exploration, and testing of the application endpoints with OpenAPI using [Swagger UI](https://github.com/swagger-api/swagger-ui). In this document, we will visit different options on how to provide [Swagger UI](https://github.com/swagger-api/swagger-ui) endpoint securely.

As explained in [Third Party JavaScript Management Cheat Sheet by owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html), the invocation of third-party JS code in a web application requires consideration for 3 risks in particular:

**1. The loss of control over changes to the client application**

This risk arises from the fact that there is usually no guarantee that the code hosted at the third-party will remain the same as seen from the developers and testers: new features may be pushed in the third-party code at any time, thus potentially breaking the interface or data-flows and exposing the availability of your application to its users/customers.

**2. The execution of arbitrary code on client systems**

This risk arises from the fact that third-party JavaScript code is rarely reviewed by the invoking party prior to its integration into a website/application. As the client reaches the hosting website/application, this third-party code gets executed, thus granting the third-party the exact same privileges that were granted to the user (similar to XSS attacks).

**3. The disclosure or leakage of sensitive information to 3rd parties**

When a third-party script is invoked in a website/application, the browser directly contacts the third-party servers. By default, the request includes all regular HTTP headers. In addition to the originating IP address of the browser, the third-party also obtains other data such as the referrer (in non-https requests) and any cookies previously set by the 3rd party, for example when visiting another organization's website that also invokes the third-party script.

## Mitigating Risks

Following strategies can be implemented to mitigate the above risks.

### 1. External Script Hash

[Content Security Policy (CSP)](https://www.w3.org/TR/CSP3/#external-hash) offers using a `hash` to allow the execution of specific scripts on a page that ensures the content matches their expectations.

First step is to use the `Content-Security-Policy` HTTP response header field. It is the preferred mechanism for delivering a policy from a server to a client. 

```
Content-Security-Policy = 1 #serialized-policy
                    ; The '#' rule is the one defined in section 5.6.1 of RFC 9110
                    ; but it incorporates the modifications specified
                    ; in section 2.1 of this document.
```

An example of this policy implementation can be returning following header in the page response:

```
Content-Security-Policy: script-src 'sha256-abc123' 'sha512-321cba'
```

In the presence of that policy, the following script elements would be allowed to execute because they contain only integrity metadata that matches the policy:

```
<script integrity="sha256-abc123" ...></script>
<script integrity="sha512-321cba" ...></script>
<script integrity="sha256-abc123 sha512-321cba" ...></script>
```

While the following script elements would not execute because they contain valid metadata that does not match the policy (even though other metadata does match):

```
<script integrity="sha384-xyz789" ...></script>
<script integrity="sha384-xyz789 sha512-321cba" ...></script>
<script integrity="sha256-abc123 sha384-xyz789 sha512-321cba" ...></script>
```

To implement this option, we have to calculate the `hash` of all external file content and include in the headers:

```bash
echo -n 'doSomething();' | openssl sha256 -binary | openssl base64
```

The `hash` will be then attached to the script tags respectively.

```html
<script integrity="sha256-abc123" ...></script>
```
----

### 2. Import npm package and serve from TS

> **⚠️ This option requires further investigation on server side rendering of this package. As we are building an API and not a SPA, due to Swagger UI doesn't support server side rendering functionality, we will disregard this option.**

[Swagger UI](https://www.npmjs.com/package/swagger-ui) documentation strongly suggest that we use `swagger-ui` instead of `swagger-ui-dist` since swagger-ui-dist is significantly larger. They suggest using `swagger-ui` when the tooling makes it possible, as `swagger-ui-dist` will result in more code going across the wire.

Using [Swagger UI](https://www.npmjs.com/package/swagger-ui), we can implement this package in our endpoint if we were to build a SPA.

```typescript
import * as ccfapp from "@microsoft/ccf-app";
import { SwaggerUIBundle } from 'swagger-ui-dist';

/**
 * Generate a swagger UI based on the OpenApi documents of (Application - Governance)
 * How to configure swagger UI: https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/
 */
export function getSwaggerUI(): ccfapp.Response<string> {

  const ui = SwaggerUIBundle({
      urls: [
        {url: "/app/swagger.json", name: "Application API"}, /* '/app/api' will be used when ccf allow more control on openAPI document to be done through deployment bundle */
        {url: "/gov/api", name: "Governance API"},
        {url: "/node/api", name: "Operator API"}
      ],
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "StandaloneLayout",
    });

    return ui;
};
```

### 3. Download external script and serve from the local repo

This option is implemented by simply downloading the following script and css files and commit to this repo. These files will be imported to the HTML by a relative path.

Scripts to download:

```
https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js

https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js
```

CSS to download:

```
https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css
```

The HTML created to serve the swagger ui will be updated to relative paths:

```html
<head>
    .....
    <link rel="stylesheet" href="public/css/swagger-ui-dist@4.5.0/swagger-ui.css" />
    <script src="public/scripts/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
    <script src="public/scripts/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
    ....
</head>
```

## Decision

| Options  | Implementation Complexity | Maintanence | Security Concerns |
| -------  | ------------------------- | ----------- | ----------------- |
| Option 1 | Moderate                  | Moderate    | Covered           |
| Option 2 | Hard                      | Hard        | Covered           |
| Option 3 | Easy                      | Easy        | Covered           |

**Decision**: 

Option 1 is the most lightweight and flexible option (integrity with the flexibility to serve from anywhere), but assumes client-side support.

## Consequences

- `/swagger` endpoints need to implement `Content-Security-Policy`

## References

- https://www.w3.org/TR/CSP3/#external-hash
- https://www.npmjs.com/package/swagger-ui

