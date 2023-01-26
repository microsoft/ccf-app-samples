# Data Ingest API

## Status

Approved

## Context

We need to build an API that ingests data into our system. Once ingested, we need to store this data in the K-V store so we can reconcile it and generate reports on the ingested data.

Gathered requirements:

- Members of the network will decide on a data schema ahead of ingest.
- Members and users of the network can ingest data via the API. Data will be ingested via JSON or CSV, which will include:
  - one unique identifier (string)
  - one attribute associated with the unique identifier (string)
- There is likely going to be a UI on top of our ingest API, so we will treat our app like a backend   system. Therefore, we will accept JSON into our ingest API.
- As captured in [Ingestion Format ADR](./07-ingestion-format.md), many financial institutions transmit their data in comma-separated value (CSV) files. Therefore we will also accept CSV for data ingestion.
- The CSV file data headers must follow the same schema specified for the JSON file.

## Decision

## API 

### JSON Ingestion Endpoint

- Description
  - Ingest member or user data and add it to the K-V store via JSON
- Path
  - /ingest
- HTTP Method
  - POST
- URL Params
  - N/A
- Headers
  - content-type: application/json
- Request will be a `ccfapp.Request` object. We will interrogate the `ccfapp.Request` object to extract the user or member and [authenticate them via certificates](#security). We will read the request body as JSON.
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

### CSV Ingestion Endpoint

- Description
  - Ingest member or user data and add into the K-V store via CSV.
  - Data is converted to JSON from the application
- Path
  - /csv/ingest
- HTTP Method
  - POST
- URL Params
  - N/A
- Headers
  - content-type: text/csv
- Request will be a `ccfapp.Request` object. We will interrogate the `ccfapp.Request` object to extract the user or member and [authenticate them via certificates](#security). We will read the request body as a text and do the conversion within the code.
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

Users will be [authenticated via certificates](./04-Authentication.md), which is natively supported by the CCF framework.

## Models

### Data Schema Model

The ingest model has been documented by [this ADR](./02-data-schema-strategy.md#option3-defining-data-schema-via-deployment). Our ingest data model will look like this:

```typescript
export interface DataSchema {
    key: string;
    value: string | number;
}
```

### Default Data Schema

The defined default data schema is described below. JSON and CSV files must follow it to be accepted in the application.

```typescript
const schema: DataSchema = {
  key: { name: "lei", type: "string" },
  value: { name: "nace", type: "string" },
};
```

### Data Record Model

Upon ingest, `DataSchema` records will be mapped to a `DataRecord` model. `DataRecords` can be either string or numeric.

```typescript
export type DataAttributeType = string | number;
export interface DataRecordProps {
  key: string;
  value: DataAttributeType;
}
```

### Repository Model

Our repository will be a K-V store. Our K-V store will be defined as:

```typescript
const kvStore = ccfapp.typedKv(
  "data",
  ccfapp.string,
  ccfapp.json<ReconciledRecord>()
);
```

A `ReconciledRecord` represents all users who submitted data on the record and their opinion of the record.

```typescript
export class ReconciledRecord implements ReconciledRecordProps {
  key: string;
  values: ReconciliationMap = {};
```

The `ReconciliationMap` is a map where the key is the user ID and the value is the record submitted by the user. For example,

```json
{
  "key": "A0129",
  "value": {
    "Member 1": "google",
    "Member 2": "alphabet"
  }
}
```

A `ReconciledRecord` can be `updated` or `created` via ingest depending on whether the key exists.

## Service

### Ingest Service

The ingest service will `update` or `create` a `ReconciledRecord` from `DataRecords` before saving it to the K-V store.

```typescript
submitData(userId: string, dataRecords: DataRecord[])
```

- Service will leverage the repository layer defined below
- Service will contain the following business logic:
  - Check if the key already exists in the repository via `get`
    - if it exists, `update` the existing `reconciled-record` via `set`
    - else, add a new `reconciled-record` via `set`

## Repository

### K-V Repository

We will leverage the CCF framework to read and write from kv::Map objects.

- `set`
  - Add/Update a record
- `get`
  - Retrieves a record given a key

Reference: https://microsoft.github.io/CCF/main/build_apps/kv/api.html#_CPPv4N2kv18WriteableMapHandle3putERK1KRK1V

## Consequences

The consequences outlined below may be future areas of improvement for our application.

### 1. Schema Flexibility

This design does not allow flexibility for schema definition. Reference [adr](./02-data-schema-strategy.md#option3-defining-data-schema-via-deployment)

### 2. There is no Ingest Model Stored

This design does not store the originally ingested data by each member. Rather, the ingest api has the responsibility of storing a `ReconciledRecord`. This may cause a number of issues:

Q: There is no way to audit, and members/users cannot see the original data they ingested. Is this a concern?

A: Members will not use the data reconciliation k-v store for audit. Members have their data on-prem or managed elsewhere. This app is solely for data reconciliation, not auditing. Realistically, if a member needed to get a snapshot of the data they ingested into the data reconciliation app at a certain time, the ledger is actually tracking the historic transactions on the K-V store. This should be a capability provided by CCF. Auditing is not a capability we need to build or factor into design decisions.

### 3. Ingest Design - Data Mutability?

Q: Is data mutable?

A: Data records are mutable! When new data is submitted by a member, the data could be a mix of records that need to be created or conceptually "updated" or "deleted". However, our K-V store is append-only. We can only communicate with the local store by reading and writing. When a record requires "updating," we will simply rewrite it for the K-V Store.

When working with an append-only store, there is no concept of [deleting](https://microsoft.github.io/CCF/main/build_apps/kv/kv_how_to.html#removing-a-key) or updating. Members will never want to delete data records. If a member stops submitting data on a record in subsequent data ingests, we will continue to report on that record. We will not delete the record from the K-V store; therefore, we will report on all records ever submitted by the member. Yes, this means the ledger will grow in size.

An E2E data flow is captured [here](../images/data_recon_sample.png) with input from our PO. Hopefully, this has cleared up any confusion.

### 4. K-V Design: Expensive to Reconcile & Report

By only storing the `ReconciledRecord`, generating a report for a particular member is an expensive operation. We need to scan the entire K-V store to check the values for each key to create the report.

Q: Is there a better way to design our system to increase performance on reconciling and reporting?

A: Probably! Our current design requires us to scan and read from the entire K-V store to generate a member's report. Please see further discussion here: [improve-performance adr](./08-improve-performance.md). We have considered the data-reconciliation app to be write heavy, therefore, we have implemented the current approach, which is write-efficient.
