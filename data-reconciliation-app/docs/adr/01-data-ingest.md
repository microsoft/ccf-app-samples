# Data Ingest API

## Status

Proposed

## Context

We need to build an API that ingests member data into our system. Once injected, we also need to store this data in the K-V store.

Gathered requirements:

- Members will upload data via csv
- Members will upload multiple records (batch) or single records via csv
- Data will have one attribute, and we will only work with string attributes for now.

## Decision

### Endpoint

```
POST  /csv
// Endpoint ingests data into data reconciliation app
	• URL Params
        None
	• Headers
        Content-Type: application/json
	• Request is ccfapp.Request object
		○ Reuest Body = CSV text
		○ Request UserID =
	• Status: 200
    • Status Text: "Data has been successfully recorded"
```

### Service Layer - CSV Service

```
// injects member data into CCF K-V store
SubmitData(userId, csv body))
	• Parse spreadsheet
		○ Any validation error
        ○ Grab headers of spreadsheet
		○ Check if key exists
            - if exists, update vote
            - else, save to K-V Store
```

### K-V Store data structure

- Key: Unique Id (string)
- Value: Attribute object
  - id: attribute header (string)
  - type: string or number (string for our MVP)
  - votes: Map<UserID (string), Attribute Value (string)>

### Sample Data

From Member 1:

| lei   | company_name |
| ----- | ------------ |
| A0128 | microsoft    |
| A0129 | google       |
| A0130 | amazon       |

From Member 2:
| lei | company_name |
|---|---|
| A0128 | microsoft |
|A0129 | alphabet |
| A0130 | amazon |

### Sample store

```json
{
  "key": "A0129",
  "value": {
    "id": "company_name",
    "type": "string",
    "votes": {
      "Member 1": "google",
      "Member 2": "alphabet"
    }
  }
}
```

## Consequences

It is only in scope to handle data with one attribute. It is possible in the future, the app may handle muliple attributes of string or numeric types. If that becomes a requirement in the future, we should have another ADR. But it was part of the conversation...so I'll capture some initial thoughts here:

### Many Attributes -- Out of Scope

- Key: Unique Id (string)
- Value:
  - schema_def: JSON Schema for attributes
  - votes: Map<UserID (string), Attribute Values (string)>

From Member 1:

| lei   | company_name | zip_code |
| ----- | ------------ | -------- |
| A0128 | microsoft    | 12361    |
| A0129 | google       | 12121    |
| A0130 | amazon       | 12456    |

From Member 2:
| lei | company_name |zip_code
|---|---|---|
| A0128 | microsoft |12361
|A0129 | alphabet |12122
| A0130 | amazon |12456

```json
{
  "key": "A0129",
  "value": {
    "schema_def": {
      "company_name": {
        "type": "string"
      },
      "zip_code": {
        "type": "number"
      }
    },
    "votes": {
      "Member 1": {
        "company_name": "google",
        "zip_code": "12121"
      },
      "Member 2": {
        "company_name": "alphabet",
        "city": "12122"
      }
    }
  }
}
```
