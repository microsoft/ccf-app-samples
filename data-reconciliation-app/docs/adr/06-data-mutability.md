# Data Mutability

## Status

Proposed

## Context

We need to store the data from an Ingest API in a Key/Value store (Map). We need to provide a mechanism for data to be updated after an initial ingestion. 

### Mutability?
1. Members can ingest data or query for a report on data at anytime. There is no concept of a session. For example, let's say member 1,2,3 submit data on a Monday. If member 1 submits more data on a Tuesday, reports for all members (Tuesday onwards) will be generated based on members 2 & 3's Monday data and member 1's Tuesday data.

2. Data records are mutable! When new data is submitted, the data could be a mix of records that conceptually need to be created or "updated". Our K-V store is append-only. We can only read and write to the local store. When working with an append-only store, there is no concept of deleting or updating. https://microsoft.github.io/CCF/main/build_apps/kv/kv_how_to.html#removing-a-key

## Decision

When a record needs to be "updated" we will really just be re-writing. Members will never want to delete data records. If they stop reporting on a record in subsequent data ingests, this does not mean we will delete the record from the K-V store. We will continue to report on all records ever submitted by the member. Yes...this means the ledger will grow in size..but we just need to ensure there are no duplicate records.

This is captured here: [https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/demo/images/data_recon_sample.png](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/demo/images/data_recon_sample.png)

Members will not use the data reconciliation k-v store for audit. Members have their data on-prem or managed elsewhere. This app is solely for data reconciliation, not auditing. Realistically, if a member needed to get a snapshot of the data they entered into the data reconciliation app at a certain time, the ledger is actually tracking the historic transactions of the k-v store. This should be possible/a capability provided by CCF. Auditing is not a capability we need to build or factor into any design decisions

## Example

- Member A ingests 100 records
- Member B ingests 1000 records
- Member A reconciles and receives 100 results back
- Member A ingests 2000 records
- Member A reconciles and receives 2000-2100 results back
- Member B reconciles and receives 1000 results back

Of the 2000 newly ingested records by member 1, these records could be a mix of records that are completely new, or updated values on the previous 100 records submitted. We cannot assume the 100 original records are a subset of the 2000 records.

Therefore when Member A reconciles the second time, they could receive anywhere from 2000-2100 records back.