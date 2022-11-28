# Contact discovery application

This is a sample application of a contact discovery service.

## Use case

A contact discovery service is required.
Users should be able to check if friends or colleagues's phone numbers are registered in the application using their address book without revealing
their contact information to the application server.

## What the application does

This application provides a REST API with the following endpoints:

- PUT /app/numbers/{hashed_number}
  - Register user's number
  - It can be called by [users](https://microsoft.github.io/CCF/main/overview/glossary.html#term-Users)
  - Status code for successful calls: 204
- GET /app/find-contacts/
  - Check if given numbers are registered.
  - It can be called by [users](https://microsoft.github.io/CCF/main/overview/glossary.html#term-Users)
  - Request body: Array of hashed phone numbers to be checked.
  - Response: Status code 200 with an array of hashed registered phone numbers in request

## Why CCF?

If the application is built with CCF, node [operators](https://microsoft.github.io/CCF/main/overview/glossary.html#term-Operators) cannot see the registered phone number. Therefore, users don't have to trust them. Note
that even phone numbers are hashed, it's easy to get the raw number from a hash because the number of phone numbers is limited.

## How to run the tests

The contact discovery application has a suite of tests that run in a sandbox; please ensure you do not have an existing sandbox running.

```bash
cd contact-discovery-app
make test
```

## Interact with the sandbox manually

You can always run the sandbox yourself: -

```bash
cd contact-discovery-app
# The dev container would have installed your npm packages for you

npm run build # Transpile the TypeScript code to JavaScript and copy the output to `dist` directory

initial_number_of_members=1
initial_number_of_users=3
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count $initial_number_of_members --initial-user-count $initial_number_of_users
```

You can find example usage in `./test.sh`.
