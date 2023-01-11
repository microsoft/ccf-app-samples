# Data Ingest API

## Status

Approved

## Context

We need to build an API that ingests data into our system. Once ingested, we also need to store this data in the K-V store so we can reconcile and report out on the data.

Gathered requirements:

- Members of the network will decide on a data schema ahead of ingest.
- Members and Users of the network can ingest data via the API. Data will be ingested via JSON which will include:
  - one unique identifier (string)
  - one attribute associated with the unique identifier (string)
- There is likely going to be a UI on top of our ingest API...so we will treat our app like a backend system. Therefore, we will accept JSON into our ingest API.

## Decision

## API

### Endpoint

- Description
  - Ingest member or user data into our application and add data to K-V store
- Path
  - /ingest
- HTTP Method
  - POST
- URL Params
  - N/A
- Headers
  - content-type: application/json
- Request will be a `ccfapp.Request Object`. We will interrogate the `ccfapp.Request Object` to extract the user or member and [authenticate them via certficates](#security). We will read the request body as a JSON.
- API Status Codes
  - OK
    - Status: 200
    - Status Text: "Data has been ingested"
  - UNAUTHORIZED
    - Status: 401
    - Status Text: "Unauthorized"
  - BAD_REQUEST
    - Status: 400
    - Status Text: "Validation Error"

### Security

Users will be authenticated via certificates, which is natively supported by the CCF framework.

//TODO Add reference to this future ADR: https://github.com/microsoft/ccf-app-samples/issues/102

## Models

### Data Schema Model

The ingest model has been documented by [this ADR](./02-data-schema-strategy.md#option3-defining-data-schema-via-deployment). Our ingest data model will look like:

```
export interface DataSchema {
    key: string;
    value: string | number;
}
```

### Data Record Model

Upon ingest, `DataSchema` records will be mapped to a `DataRecord` model. `DataRecord`s can be string or numeric.

```
export type DataAttributeType = string | number;
export interface DataRecordProps {
  key: string;
  value: DataAttributeType;
}
```

### Repository Model

Our repository will be a K-V store. Our K-V store will be defined as:

```
const kvStore = ccfapp.typedKv(
  "data",
  ccfapp.string,
  ccfapp.json<ReconciledRecord>()
);
```

A `ReconciledRecord` represents all of users who submittted data on the record and their opinion of the record.

```
export class ReconciledRecord implements ReconciledRecordProps {
  key: string;
  values: ReconciliationMap = {};
```

The `ReconciliationMap` is a map where key is the user ID and value is the record submitted by the user. For example,

```json
{
  "key": "A0129",
  "value": {
    "Member 1": "google",
    "Member 2": "alphabet"
  }
}
```

Depending if the key exists, a `ReconciledRecord` can be `updated` or `created` new via ingest.

## Service

### Ingest Service

The ingest service will `update` or `create` a `ReconciledRecord` from `DataRecord`s before saving to the K-V store.

```
submitData(userId: string, dataRecords: DataRecord[])
```

- Service will leverage repository layer defined below
- Service will contain business logic:
  - Check if key already exists via repository `get`
    - if it exists, `update` the `reconciled-record` & repository `set`
    - else, `create` new `reconciled-record` & repository `set`

## Repository

### K-V Repository

We will leverage the ccf framework to read and write from kv::Map objects.

- `set`
  - Creates new record
- `get`
  - Given key, retrieves record

Reference: https://microsoft.github.io/CCF/main/build_apps/kv/api.html#_CPPv4N2kv18WriteableMapHandle3putERK1KRK1V

## Consequences

The consequences outlined below may be future areas of improvement for our application.

### 1. Schema Flexibility

This design does not allow flexibility for schema definition. Reference [adr](./02-data-schema-strategy.md#option3-defining-data-schema-via-deployment)

### 2. No Ingest Model Stored

This design does not store the originally ingested data by each member. Rather, the ingest api has the responsibility of storing a `ReconciledRecord`. This may cause a number of issues:

Q: There is no way to audit and members/users cannot see the original data they ingested. Is this a concern?

A: Members will not use the data reconciliation k-v store for audit. Members have their data on-prem or managed elsewhere. This app is solely for data reconciliation, not auditing. Realistically, if a member needed to get a snapshot of the data they inputed into the data reconciliation app at a certain time, the ledger is actually tracking the historic transactions on the k-v store. This should be possible/a capability provided by CCF. Auditing is not a capability we need to build or factor into design decisions.

### 3. Ingest Design - Data Mutability?

Q: Is data mutable?

A: Data records are mutable! When new data is submitted by a member, the data could be a mix of records that need to be created new or conceptually "updated" or "deleted". However, our K-V store is append-only. We can only read and write to the local store. When a record needs to be "updating", we will really just be re-writing to the K-V Store.

When working with an append-only store, there is no concept of [deleting](https://microsoft.github.io/CCF/main/build_apps/kv/kv_how_to.html#removing-a-key) or updating. Members will never want to delete data records. If a member stops submitting data on a record in subsequent data ingests, we will continue to report on that record. We will not delete the record from the K-V store; therefore, we will report on all records ever submitted by the member. Yes, this means the ledger will grow in size.

An E2E data flow is captured [here](../images/data_recon_sample.png) with input from our PO. Hopefully this clears up some confusion.

### 4. K-V Design - Expensive to Reconcile & Report

By only storing the `ReconciledRecord`, we make "updating" of a key for a particular member harder. Addititionally, when we create a report on the reconciled data, members/users will only receive a report on the keys they submitted. By using the `ReconciledRecord`, we will have to check the values for each key to create the report.

Q: Is there a better way to design our system to increase performance on reconciling and reporting?

A: Probably! Our current design requires us to scan and read from the entire K-V store to generate a member's report. This is an expensive operation Adding a ticket to the backlog to investigate improvements to our design.
