# Performance Improvement for Reconciliation & Reporting

## Status

Proposed

## Context

The purpose of this ADR is to improve performance on reconciling and reporting.

## Options

### Option 1

We can store the pre-generated summary report for each member in our KV-store. When a member request for its report we can fetch the report based on memberId and send it to the respective member.

#### Implementation

When a member calls an ingest API, for each key in the request body our ingest service has to follow the below steps :

- For each member check whether the key is present or not
- If present, retrieve the value ingested by all the members
- Generate the summary record for that key
- Add / Update the summary record for all the members who have ingested the current key

#### Consequences

- Will degrade the performance of ingest API heavily 
- Storing summary report for each member will require more storage space
- Data redundancy

### Option 2

We can store all the keys ingested by each member in the KV store in addition to the `ReconciliationMap`. To generate a report for a particular member 
 - Retrieve the keys from the KV store for that member
 - Fetch the `ReconciliationRecord` for each retrieved key and generate the summary record as a response.

#### Implementation

While ingesting data for a member we can add all the keys in the request in our KV-store in addition to the current implementation in ingest API.

To generate report for a member, we can follow the steps below:

- Check whether member is present or not
- If member is present, we can fetch the keys (first 50 Id's), that has been ingested by the member 
- For this 50 Id's we next fetch the ReconciliationRecord from our KV-store
- Generate summary record for each item in the ReconciliationRecord
- Send the above summary record as a response to the member
- Add pagination in order to retrieve the next set and so on

#### Consequences

- Will slightly degrade the performance of ingest API as each record in the request body will need to be stored
- Storing ingested keys will require more storage space
- Keys ingested by each member will keep growing and storing will require sharding in future

## Decision

We can discard option 1 as it will degrade the performance of ingest API heavily.

Option 2 will be an improvement on the current design for reconciliation and reporting in the application. However it will slow down the performance of ingest API by O(n), n being the number of key-value pairs in the request body.

Depending on whether our data-reconciliation app is write heavy or read heavy, we can either go with the [current design](./01-data-ingest.md) or go with option 2. We can also add pagination in our current design for reconciliation and reporting as the volume of data could be large.