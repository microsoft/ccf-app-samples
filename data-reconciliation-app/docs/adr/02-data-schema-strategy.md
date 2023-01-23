# Data Schema Strategy

## Status

Decided

## Context

We need to build an API that ingests members' data into our system. Once ingested, we need to store this data in the K-V store. Members will decide on a data schema used for ingesting, data reconciliation, and reporting.

There are multiple strategies for data schema definition and usage. In this document, we lay out our decision and some other alternatives considered.

## Alternatives

### Option1: Fully Flexible Data Schema

In this strategy, members define their data schema and submit it as part of data ingestion. The API will take the schema and map it to an internal universal schema before storing it in the K-V store. When a member requests a data reconciliation report, the API will generate the report using the internal universal schema. This will result in members understanding the schema of the report and possibly converting it back to their own custom format to use on their side.

Data ingestion API payload could become:

```json
POST /submit-data

{
    "data": [
        {
            "key": "abcde",
            "value": "12345"
        }
    ],
    "schema": {
        "key": "id",
        "value": "value"
    }
}
```

This option require members to reset their previously submitted data and re-submit it when they change their schema.

While this option provides the maximum flexibility for members to submit data in any form, it introduces data validation and mapping, report generation challenges in each layer of the API.

### Option2: Defining Data Schema via API

In this strategy, members define their data schema using a dedicated endpoint and API to store their schema definition in the K-V store. When a member submits new data, the API retrieves the data schema from the K-V store and uses that schema to perform validation, data reconciliation, and so on. When a member requests a data reconciliation report, API will generate the report using the registered data schema format.

Data schema registry API payload could become:

```json
POST /register-schema

{
    "schema": {
        "key": "id",
        "value": "value"
    }
}
```

```json
POST /submit-data

{
    "data": [
        {
            "key": "abcde",
            "value": "12345"
        }
    ],
}
```

This option requires a member to reset their previously submitted data and re-submit it when they change their schema.

While this option provides great flexibility for members, it introduces lots of data mapping and validation challenges that won't be feasible within the project timeline.

### Option3: Defining Data Schema via Deployment

In this strategy, a new data schema is defined at the code level and deployed into the CCF network. This also includes implementing data schema validation at the endpoint, service, and repository layers before deployment. It can produce a breaking change or a backward compatible change, depending on the changes. This will require all members to update their integrations to submit data and produce reconciliation reports when a new version of the application is deployed. However, the data will be consistent throughout, from the endpoints all the way to the reporting.

Data schema definition at the API could become:

```typescript
export interface DataSchema {
  key: string;
  value: string | number;
}
```

Data submission could become:

```json
POST /submit-data

{
    "data": [
        {
            "key": "abcde",
            "value": "12345"
        }
    ],
}
```

This option requires a member to reset their previously submitted data and re-submit it when they change their schema.

While this option provides limited flexibility for members, it introduces maximum reliability and consistency at each layer of the application. This option helps build an API through contracts (data schema).

## Decision

This is a summary of alternatives, each with their own complexity and flexibility:

|  Options | Flexibility | Data Reset on Schema Changes | Integration Changes on Schema Changes | Implementation Complexity |
| -------: | ----------: | ---------------------------: | ------------------------------------: | ------------------------: |
| Option 1 |     Maximum |                            ✓ |                                     ✓ |                      Hard |
| Option 2 |    Moderate |                            ✓ |                                     ✓ |                    Medium |
| Option 3 |     Minimum |                            ✓ |                                     ✓ |                      Easy |

Considering project timelines from an implementation complexity angle, **we have decided to implement Option 3 in this application.**

## Consequences

Implementing the data schema definition at the code level creates the following consequences:

1. Deploy new schema changes
1. Members must update their API integration
1. Minimum flexibility and maximum consistency at API behaviours
