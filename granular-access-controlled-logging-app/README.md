# granular-access-controlled-logging-app (better naming is welcomed)

This is a sample application of logging app that takes advantage of CCF's ability for granular access control.

## Use case

You need to build a logging system that can be checked by auditors.
The amount of disposed data should be minimized.

## What the app does?

This application provides REST-ish API with following endpoints:

- POST /log/
    - Write a log record
    - It can be called by members
    - Example request body: TODO
    - Status code for successful calls: 204
- PUT: /users/{user_id}/permission
    - Set permission for a user (auditor)
    - It can be called by members
    - Example request body 0: {startSeqno: 0, endSeqno: 100, startLogId: 0: endLogId: 10}
    - Example request body 1: {allowAnySeqNo: true, allowAnyLogId: true}
    - Example request body 2: {allowOnlyLatestSeqNo: true, allowAnyLogId: true}
- GET: /log/
    - Show a log record
    - It can be called by members or users
    - Prams: log_id, seq_no 
    - Response: return the item corresponding to the log_id and seq_no. If the log_id or seq_no is not allowed to the user, returns 403.

TODO: implement

## Why CCF?

There are multiple reasons that you want to use CCF for the logging system.

TODO

## How to run the app in sandbox

```bash
$ cd granular-access-controlled-logging-app
$ npm i # Necessary only for the first time

$ npm run build # Transpile the TypeScript code to JavaScript and copy the output to `dist` directory 

$ /opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/
```
