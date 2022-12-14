# Data Ingest Batch

## Status

Proposed

## Context

We need to store the data from the Ingest API in a Key/Value store (Map). We need to provide a mechanism for data to be updated or deleted after an initial ingestion. 

### Full or Delta?
- Each member supplies a complete corpus of their reference data in each ingestion. This means we would treat each members data as immutable and handle record addition/deletion by clearing that members data and creating a new Map on ingestion.
- When data is ingested it is marked whether it is add/delete.

### Data Model for ingestion
When we store the data in a Map, we could store it in 2 formats. This is purely for ingest and not for reconciliation.

#### Option 1
This pattern is simpler if members are uploading full data sets
```json
{
  "member1": [
    {
      "id": "A0128",
      "company_name": "microsoft"
    },
    {
      "id": "A0129",
      "company_name": "google"
    },
    {
      "id": "A0130",
      "company_name": "amazon"
    }
  ],
  "member2": [
    {
        "id": "A0128",
        "company_name": "microsoft"
    },
    {
        "id": "A0129",
        "company_name": "alphabet"
    },
    {
        "id": "A0130",
        "company_name": "amazon"
    }
  ]
}
```

#### Option 2
If the ingest was able to tell us if data was added or deleted, we could favour a compound key.
```json
[
    {
        "id": "member1:A0128",
        "company_name": "microsoft"
    },
    {
        "id": "member1:A0129",
        "company_name": "google"
    },
    {
        "id": "member1:A0130",
        "company_name": "amazon"
    },
    {
        "id": "member2:A0128",
        "company_name": "microsoft"
    },
    {
        "id": "member2:A0129",
        "company_name": "alphabet"
    },
    {
        "id": "member2:A0130",
        "company_name": "amazon"
    }
]
```

## Decision

For the purpose of this sample, we will assume that each member ingests their full data set each time. It is the process of `Reconciliation` that calculates the consensus for that particular member. A member will only receive a resultset with the same number of records that they ingested

## Example

- Member A ingests 100 records
- Member B ingests 1000 records
- Member A reconciles and receives 100 results back
- Member A ingests 2000 records
- Member A reconciles and receives 2000 results back
- Member B reconciles and receives 1000 results back

The 2000 records that Member A uploaded the second time may not include any of those original 100 records

Calling `ingest` and `reconcile` do not have to happen straight after each other.
