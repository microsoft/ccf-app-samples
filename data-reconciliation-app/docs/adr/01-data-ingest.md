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

1. This design does not allow flexibility for schema definition. Reference [adr](./02-data-schema-strategy.md#option3-defining-data-schema-via-deployment)
2. This design does not store the originally ingested data by each member. Rather, the ingest api has the responsibility of storing a `ReconciledRecord`. This may cause a number of issues:
   - There is no way to audit and members/users cannot see the original data they ingested. Is this a concern?
   - By only storing the `ReconciledRecord`, we make updating or removal of a key for a particular member harder. Is the data immutable?
   - When we create a report on the reconciled data, members/users will only receive a report on the keys they submitted. By using the `ReconciledRecord`, we will have to check the values for each key.

We need to talk to our Product Owner to determine if the data ingested is immutable and/or if auditing is a concern. We also need to see how expensive creating a report is given our `ReconciledRecord` model.
