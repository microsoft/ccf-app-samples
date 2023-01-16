# Ingestion Format

## Status

Proposed

## Context

Currently the data reconciliation sample ingests data in json format. Many financial institutions transmit their data in Comma Seperated Value (CSV) files.

There are numerous ways that we can accept CSV. In this document, we lay out our decision and some other alternatives considered.

## Alternatives

### Option 1: Add an endpoint that accepts `text/csv`

We could add an endpoint that accepts the CSV data as text in the body of an HTTP post. The ingest endpoint would be responsbile for parsing this CSV and creating an array of DataRecords. The CCF team have previously used https://www.papaparse.com/ to parse csv into an array. If the schema needed to change in the future, both postHandlerJson and postHandlerCsv would have to be amended.

This option means that we would have tests for both endpoints and offers the client the most flexibility.

While this option provides the maximum flexibility, you could argue that this is a sample and does not have to implement multiple content types.

### Option 2: Amend test / demo harness to convert csv into json and ingest the data over existing endpoint.

We currently read json files in the correct format in a shell script and send the data over curl. If we maintain a scripting approach, then we would have to convert csv to json in bash as an extra step before we interacted with the API.

One thought is that we could replace our test / demo harness to use TypeScript so that we didn't have to use curl and at this stage we could use that application to convert csv to json using a library and interact with the existing API.

This approach means all of the csv capabilities are in the test harness and not the data reconciliation app. This may be the right solution if we are feature complete on data reconciliation and no more major features will be added.

### Option 3: Provide a simple standalone script / tool that converts csv into json.

This option would take the form of a utility that was kept in the sample folder that was able to convert csv files into json documents based on our accepted schema. This could be written in Python / TypeScript or even Bash. 

This option would be a courtesy utility rather than enhancing the data-reconciliation application. Although this means no changes would be made to the api or the test harness, it might not be what a customer was intending and introduces another processing stage.

## Decision

This is the summary of alternatives by their flexibility and complexity.

|  Options | Flexibility | Test Harness complexity | API Complexity |
| -------: | ----------: | ----------------------: | -------------: |
| Option 1 |     Maximum |                     Low |            Low |
| Option 2 |    Moderate |                  Medium |            N/A |
| Option 3 |     Minimum |                     N/A |            N/A |

Considering the project timelines and keeping the implementation in a single place, **we have decided to implement Option 1 in this application.**

## Consequences

1. By implementing csv parsing logic in the API we will have to amend the demo to have at least one member ingesting over the csv ingest endpoint to ensure it is tested.
1. Any schema changes, although localised to the ingest endpoint, will have to made for both functions; this was already a consequence that was decided in the Data Schema Strategy.
