# Ingestion Format

## Status

Proposed

## Context

Currently, the data reconciliation sample ingests data in JSON format. Many financial institutions transmit their data in comma-separated value (CSV) files.

There are numerous ways that we can accept CSV. In this document, we discuss a few alternatives and lay out our decision.

## Alternatives

### Option 1: Add an endpoint that accepts `text/csv`

We could add an endpoint that accepts CSV data as text in the body of an HTTP post. The ingest endpoint would be responsible for parsing this CSV and creating an array of data records. The CCF team has previously used https://www.papaparse.com/ to parse a CSV into an array. If the schema needs to change in the future, both postHandlerJson and postHandlerCsv will have to be modified.

This option ensures we'll have tests for both endpoints and provides maximum flexibility to the client.

While this option provides the maximum flexibility, one could argue that this is a sample and does not have to implement multiple content types.

### Option 2: Modify the test/demo harness to convert CSV into JSON and ingest the data via the existing endpoint.

We currently use a shell script to read JSON files and send the data via curl. If we maintain the scripting approach, we'll have to convert CSV to JSON in bash as an extra step before interacting with the API.

One thought is that we could replace our test/demo harness to use TypeScript so that we don't have to use curl, and at this stage, we could use that application to convert CSV to JSON using a library and interact with the existing API.

This approach means all of the CSV capabilities are in the test harness and not in the data reconciliation app. This may be the right solution if we are feature complete on data reconciliation and no more major features will be added.

### Option 3: Provide a simple standalone script/tool that converts CSV into JSON.

This option would be a utility kept in the sample folder to convert CSV files into JSON documents based on our accepted schema. This could be written in Python, TypeScript, or even Bash. 

This option would be a courtesy utility rather than enhancing the data-reconciliation application. Although this means no changes to the API or the test harness, it might not be what a customer intends and introduces another processing stage.

## Decision

This is the summary of alternatives ranked by their flexibility and complexity.

|  Options | Flexibility | Test Harness complexity | API Complexity |
| -------: | ----------: | ----------------------: | -------------: |
| Option 1 |     Maximum |                     Low |            Low |
| Option 2 |    Moderate |                  Medium |            N/A |
| Option 3 |     Minimum |                     N/A |            N/A |

Considering the project timelines and keeping the implementation in one place, **we have decided to implement Option 1 in this application.**

## Consequences

1. By implementing CSV parsing logic in the API, we'll need to modify the demo to have at least one member ingesting data in CSV format to ensure it is tested.
1. Any schema changes, although localized to the ingest endpoint, will have to be done for both functions; this was already a consequence that was mentioned in the [Data Schema Strategy](./02-data-schema-strategy.md).
