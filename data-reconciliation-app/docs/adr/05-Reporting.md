# Data Reporting API

## Status

Proposed

## Context

We need to build an API that reports the members' and users' reconciled records back to them.

## Requirements:
- A report can be requested for a single record or for all records.
- Members and Users will receive a report only for the data they have ingested.
- A reconciliation report can be requested anytime by any member, and the report result will be presented based on the most recent data present in the KV store for the entire network.
- Reconciliation rules are described in [Reconciliation Logic ADR](./03-reconciliation-logic.md).
- If a report turns out to be empty, an error message shall be returned saying that the user has no data to be reconciled.

## API Endpoints

### Report for a single record

- Description
  - Retrieve the key from the KV store and use reconciliation logic to generate the report for a single record.
- Path
  - /report/{key}
- HTTP Method
  - GET
- URL Params
  - key: the record key to be found in the KV store
- Headers
  - N/A
- Request will be a `ccfapp.Request` object. We will interrogate the `ccfapp.Request` object to extract the user or member and [authenticate them via certificates](#security). We will read the request body as JSON.
- API Status Codes
  - OK
    - Status: 200
    - Response: SummaryResult object in JSON format
  - UNAUTHORIZED
    - Status: 401
    - Response: "Unauthorized"
  - NO_CONTENT
    - Status: 400
    - Response: "Key does not exist."


### Report for all data

- Description
  - Generate the report for all data by scanning the KV store for keys submitted by the user.
- Path
  - /report
- HTTP Method
  - GET
- URL Params
  - N/A
- Headers
  - N/A
- Request will be a `ccfapp.Request` object. We will interrogate the `ccfapp.Request` object to extract the user or member and [authenticate them via certificates](#security). We will read the request body as JSON.
- API Status Codes
  - OK
    - Status: 200
    - Response: An array of SummaryResult objects in JSON format
  - UNAUTHORIZED
    - Status: 401
    - Response: "Unauthorized"
  - NO_CONTENT
    - Status: 204
    - Response: "No data to report."


### Security

Users and Members will be [authenticated via certificates](./04-Authentication.md), which is natively supported by the CCF framework.

## Service

### Reporting Service

The reporting service will create SummaryResult object(s) from the record(s) in KV store.

- **For all data:** This service will iterate the KV store, checking whether the member has submitted data against the key or not.
- **For a single record:** The key will be directly retrieved from the KV store and will check whether the member has submitted data against this key or not.

```typescript
getData(userId: string) : SummaryResult[]                   // for all data
getDataByKey(userId: string, key: string) : SummaryResult   // for a single record
```

## Model

### Summary Result Object

The [SummaryResult object](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/src/models/summary-record.ts) will be the final output in the report. In the report, the key and value will match the schema defined.



```json
{
  "lei": "<record key>",
  "nace": "<value informed by User>",
  "group_status": "<value>",
  "total_votes_count": "#",                 // total opinions count - initially commented (DEMO CHANGE)
  "count_of_unique_values": "#",            // count of unique values
  "members_in_agreement": "#",              // # of members in agreement with the User value
  "majority_minority": "<calculated value>" // relative to the number of active members in the network
} 
```
For more detailed information regarding how each property above is calculated, refer to the [Reconciliation Logic ADR](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/adr/03-reconciliation-logic.md)

During its creation, the [`voting_threshold`](./03-reconciliation-logic.md#voting-threshold) must be passed to it, as some of the calculations for its properties need this information.
Additionally, the `total number of members in the network` is needed, and this can be retrieved from the CCF members' information.

