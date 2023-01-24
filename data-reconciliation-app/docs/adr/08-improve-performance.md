# Performance Improvement for Reconciliation & Reporting

## Status

Approved

## Context

This ADR has been created to address concerns raised by our [data ingest design](01-data-ingest.md#4-k-v-design---expensive-to-reconcile--report). By design, our application is write-efficient. As a result, the application stores by record key, not by member. In order to generate a report by member, our application must scan the entire k-v store to create a report. Our goal is to investigate if there are ways to improve performance on reading from the k-v store for reconciling and reporting. 

## Options

### Option 1

We can store the pre-generated summary report by member in our k-v store. When a member requests a report, we can fetch the report based on the `memberId` and send it to the respective member.

#### Implementation

When a member calls the ingest API, the ingest service will follow these steps for each key in the request body:

1. For each member check whether the key is present or not
2. If present, retrieve the value ingested by all the members
3. Generate the summary record for that key
4. Add / Update the summary record for all the members who have ingested the current key

#### Consequences

- Decreases performance of the ingest API as this implementation is more write-intensive
- Requires more storage space as we will store an additional summary report by each member 
- Introduces data redundancy 

### Option 2

In addition to the `ReconciliationMap`, we can store all the keys ingested by each member in the k-v store. This will allow us to more-easily generate a report for a particular member as we can:
1. Retrieve the keys from the k-v store for that member
2. Fetch the `ReconciliationRecord` for each retrieved key and generate the summary record as a response.

#### Implementation

In addition to storing the `ReconciliationMap` during ingest, we will also store all the keys by member in the request into our k-v store.

To generate report for a member, we can then follow the steps below:

- Check whether member is present or not
- Add pagination in order to retrieve the next set and so on
- For example, if member is present, we can fetch the keys (first 50 Id's), that has been ingested by the member 
- For this 50 Id's we next fetch the ReconciliationRecord from our k-v store
- Generate summary record for each item in the ReconciliationRecord
- Send the above summary record as a response to the member

#### Consequences

- This will slightly degrade the performance of the ingest API as each record in the request body will need to be stored
- Storing ingested keys will require more storage space
- Keys ingested by each member will keep growing and storing will require sharding in future

## Decision

We can discard option 1 as it will degrade the performance of ingest API heavily.

Option 2 will be an improvement on the current design for reconciliation and reporting in the application. However, it will slow down the performance of ingest API by O(n), n being the number of key-value pairs in the request body.

## Future Considerations

Given this is a sample application, we will not be implementing either option as both options potentially degrade performance on either workflow of the application (ingest or reporting). 

Depending on the customer scenario for data reconciliation, a use case could be more write-heavy or read-heavy. We suggest either move fowarding with the [current design](./01-data-ingest.md) (more ingest-friendly & write-efficient) or implement option 2 above (more reconciliation-friendly/read-efficient). Folks could also add pagination in our current design for reconciliation and reporting if the volume of data is large.