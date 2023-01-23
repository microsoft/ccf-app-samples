# Data Mutability

## Status

Approved

## Context

We need to store the data from the Ingestion API in our K-V store (Map). We need to provide a mechanism for data to be updated after initial ingestion. 

### Mutability?
1. Members can ingest data or query for a report on data at any time. There is no concept of a session. For example, consider members 1,2,3 submit data on Monday. If member 1 submits more data on Tuesday, reports for all members (Tuesday onwards) will be generated based on members 2 & 3's Monday data and member 1's Tuesday data.

2. Data records are mutable! When new data is submitted, the content can be a mix of records that conceptually need to be created or "updated". Our K-V store is append-only. We can only read and write to the local store. When working with an append-only store, there is no concept of deleting or updating. https://microsoft.github.io/CCF/main/build_apps/kv/kv_how_to.html#removing-a-key

## Decision

If a record needs to be "updated" we will just be re-writing. Members will never want to delete data records. If they stop reporting on a record in subsequent data ingestions, this does not mean we will delete the record from the K-V store. We will continue to report on all records ever submitted by the member. This means the ledger will grow in size, but our goal is to ensure there are no duplicate records.

This is captured here: [https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/demo/images/data_recon_sample.png](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/demo/images/data_recon_sample.png)

Members will not use the data reconciliation K-V store for auditing. Members have their data on-prem or managed elsewhere. This app is solely for data reconciliation purposes, not auditing. Realistically, if a member needs to get a snapshot of the data they entered into the Data Reconciliation App at a certain time, the ledger is tracking the historic transactions of the K-V store. Auditing is not a capability we need to build or factor into any design decisions. This is expected from the CCF framework, not from this sample application.

## Example

- Member A ingests 100 records
- Member B ingests 1000 records
- Member A reconciles and receives 100 results back
- Member A ingests 2000 records
- Member A reconciles and receives 2000-2100 results back
- Member B reconciles and receives 1000 results back

Of the 2000 newly ingested records by member A, these records could be a mix of records that are completely new or updated values on the previous 100 records submitted. We cannot assume the 100 original records are a subset of the 2000 records.

Therefore when Member A reconciles the second time, they could receive anywhere from 2000-2100 records back.