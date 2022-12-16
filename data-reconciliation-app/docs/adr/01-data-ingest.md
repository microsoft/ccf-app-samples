# Data Ingest API

## Status

Proposed

## Context

We need to build an API that ingests member data into our system. Once ingested, we also need to store this data in the K-V store.

Gathered requirements:

- Members will decide upon a csv schema ahead of data ingest
- Members will upload their data via csv, with headers
  - csv will have 2 columns:
    - one unique identifier (string)
    - one attribute associated with the unique identifier (string)
- There is likely going to be a UI on top of our ingest API...so we will treat our app like a backend system. Therefore, we will accept JSON into our ingest API.

## Decision

## Model for K-V store

```
//psuedo code for model based off forum app

// this is unique for each user
type User = string;

interface AttributeBase {
  votes: Record<User, T>;
}

interface StringAttribute extends AttributeBase<string> {
  type: "string";
}

interface NumericAttribute extends AttributeBase<number> {
  type: "number";
}

type Attribute = StringAttribute | NumericAttribute;

type AttributeMap = ccfapp.TypedKvMap<string, Attribute>;
```

### Sample Ingest Data

For example, from Member 1:

| id    | company_name |
| ----- | ------------ |
| A0128 | microsoft    |
| A0129 | google       |
| A0130 | amazon       |

For example, from Member 2:
| id | company_name |
|---|---|
| A0128 | microsoft |
|A0129 | alphabet |
| A0130 | amazon |

### Domain Model Sample - String Attribute

```json
{
  "Key": "A0129",
  "Attribute": {
    "votes": {
      "Member 1": "google",
      "Member 2": "alphabet"
    }
  }
}
```

### API Endpoint

- Description
  - Adds member data into K-V store, enabling each member to vote on records
- Path
  - /votes
- HTTP Method
  - POST
- URL Params
  - N/A
- Headers
  - content-type: application/json
  - x-api-key: {UUID}
- Request will be a ccfapp.Request Object, which contains:
  - user = <User>request.caller
  - csv = request.body.text()
- HTTP Status Codes
  - OK
    - Status: 200
    - Status Text: "Votes have been successfully recorded"
  - Unauthorized
    - Status: 401
    - Status Text: "Unauthorized"
  - Validation Error
    - Status: 400
    - Status Text: "Incorrect format"

### Service

```
submitVotes(userId: string, csv: string)
```

- Service will leverage repository layer defined below
- Service will contain business logic: - Check if key already exists via repository `read` - if so, update model & repository `insert` - else, create new model & repository `insert`

### Repository

Leverage ccf framework to read and write from kv::Map objects.

- `insert`
  - Creates new record in AttributeMap
- `read`
  - Given key, retrieves record from AttributeMap

Reference: https://microsoft.github.io/CCF/main/build_apps/kv/api.html#_CPPv4N2kv18WriteableMapHandle3putERK1KRK1V

## Consequences

It is only in scope to handle data with one attribute. It is possible in the future, the app may handle muliple attributes of string or numeric types. If that becomes a requirement in the future, we should update the model and complete another ADR.
