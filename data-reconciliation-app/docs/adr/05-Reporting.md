# Data Reporting API

## Status

Proposed

## Context

We need to build an API that reports the members/users' reconciled dataset back to them.

## Requirements:
- A report can be requested for a single or for all records.
- Members and Users will receive a report only for data they have ingested.
- A reconciliation report can be requested at anytime, by any member, and the report result will be presented based on the most recent data present in the KV-store for the entire network.
- Rules for reconciliation are described in [Reconciliation Logic ADR](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/adr/03-reconciliation-logic.md).
- If a report turns out to be empty, an Error message shall be returned saying that user has no data to be reconciled 

## API Endpoints

### Report for a single record

- Description
  - Report a single record by getting the key from the KV-store and run reconciliation logic
- Path
  - /report/{key}
- HTTP Method
  - GET
- URL Params
  - key: the record key to be found in the KV-store
- Headers
  - N/A
- Request will be a `ccfapp.Request Object`. We will interrogate the `ccfapp.Request Object` to extract the user or member and [authenticate them via certficates](#security). We will read the request body as a JSON.
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
  - Report all data scanning the KV-store for keys a user has submited data.
- Path
  - /report
- HTTP Method
  - GET
- URL Params
  - N/A
- Headers
  - N/A
- Request will be a `ccfapp.Request Object`. We will interrogate the `ccfapp.Request Object` to extract the user or member and [authenticate them via certficates](#security). We will read the request body as a JSON.
- API Status Codes
  - OK
    - Status: 200
    - Response: Array of SummaryResult objects in JSON format
  - UNAUTHORIZED
    - Status: 401
    - Response: "Unauthorized"
  - NO_CONTENT
    - Status: 204
    - Response: "No data to report."


### Security

Users and Members will be authenticated via certificates, which is natively supported by the CCF framework.

//TODO Add reference to this future ADR: https://github.com/microsoft/ccf-app-samples/issues/102


## Service

### Reporting Service

The reporting service will take the record(s) from KV-store and create SummaryResult object(s).

- **For all data:** This service will be responsible to iterate the KV-store checking whether the member has submitted data against the key or not.
- **For a single record:** The key will be directly retrieved from KV-store and will be checked whether the member has submitted data against this key or not.

```typescript
getData(userId: string) : SummaryResult[]                   // for all data
getDataByKey(userId: string, key: string) : SummaryResult   // for a single record
```

## Model

### Summary Result Object

The SummaryResult Object will be the final output object in the report.



```json
{
  "key": "<record key>",
  "value": "<value informed by User>",
  "group_status": "<value>",
  "total_votes_count": "#",                 // total opinions count - initially comented (DEMO CHANGE)
  "count_of_unique_values": "#",            // count of unique values
  "members_in_agreement": "#",              // # of members in agreement with the User value
  "majority_minority": "<calculated value>" // relative to the number of active members in the network
} 
```
For more detailed information regarding how each property above is calculated, refer to the [Reconciliation Logic ADR](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/adr/03-reconciliation-logic.md)

During its creation, the `voting_threshold` must be passed to it, as some of the calculations for its properties need this information.
Additionally, the `total number of members in the network` is needed, and this can be retrieved by the CCF members' information.

