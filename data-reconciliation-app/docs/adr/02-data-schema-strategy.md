# Data Schema Strategy

## Status

Decided

## Context

We need to build an API that ingests member data into our system. Once ingested, we also need to store this data in the K-V store. Members will decide on a data schema which will be used for ingesting, data reconciliation and reporting.

There are multiple strategies for data schema definition and usage. In this document, we lay out our decision and some other alternatives considered.

## Alternatives

### Option1: Fully Flexible Data Schema

In this strategy, members define their data schema and submit it as part of data ingestion. The API will take the schema and map it to an internal universal schema before storing in the K-V store. When a member requests a data reconciliation report, the API will generate the report using the internal universal schema. This will result in member to understand the schema of the report and possibly convert it back to their custom format to use at their side.

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

This option requires a member to reset their previously submitted data and resubmit again when they change their schema.

While this option provides the maximum flexibility for members to submit data in any form, it introduces data validation and mapping, report generation challenges in every layer at the API.

### Option2: Defining Data Schema via API

In this strategy, the members define their data schema using a dedicated endpoint and API to store their schema definition in the K-V store. When new data is submitted by a member, API gathers the data schema from the K-V store and then runs validate, data reconciliation etc. using that schema. When a member requests a data reconciliation report, the API will generate the report using their registered data schema format.

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

This option requires a member to reset their previously submitted data and resubmit again when they change their schema.

While this option provides great flexibility for members, it introduces lots of data mapping and validation challenges which will not be feasible within the project timeline

### Option3: Defining Data Schema via Deployment

In this strategy, a new data schema is defined at the code level and deployed into CCF network. This also includes implementing data schema validation at the endpoint, service and repository layers before the deployment. It can produce a breaking change or backwards compatible change depending on the changes. This will require all members update their integrations to submit data and to produce reconciliation reports when a new version of the application is deployed. However, data will be consistent end to end from the endpoints all the way to the reporting.

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

This option requires a member to reset their previously submitted data and resubmit again when they change their schema.

While this option provides limited flexibility for members, it introduces maximum reliability and consistency at every layer of the application. This option helps building an API by contracts (data schema).

## Decision

This the summary of alternatives by their complexity and flexibility.

|  Options | Flexibility | Data Reset on Schema Changes | Integration Changes on Schema Changes | Implementation Complexity |
| -------: | ----------: | ---------------------------: | ------------------------------------: | ------------------------: |
| Option 1 |     Maximum |                            ✓ |                                     ✓ |                      Hard |
| Option 2 |    Moderate |                            ✓ |                                     ✓ |                    Medium |
| Option 3 |     Minimum |                            ✓ |                                     ✓ |                      Easy |

Considering project timelines from implementation complexity angle, **we have decided to implement Option 3 in this application.**

## Consequences

Implementing data schema definition at code level creates following consequences:

1. Deploy new schema changes
1. Members to update their API integration
1. Minimum flexibility, maximum consistency at API behaviours.
