# What is data reconciliation means in the context of the project?

## _Reconciliation Overview_

Generally speaking, data reconciliation is used describe a verification phase where the target data is compared against original source data to address a range of issues:

- Missing records
- Missing values
- Incorrect values
- Duplicated records
- Badly formatted values
- Broken relationships across tables or systems

However, in many scenarios, there may not exist a single source of truth to compare your target data against. Rather, institutions can come together in a network to consolidate, compare and identify issues with their own data. One of the benefits of a CCF network is that these institutions can do so confidently, without actually sharing their data with one another.

Some potential use cases may involve:

- In finance, a number of financial institutions coming together to predict the price of a derivative.
- In finance, a number of financial institutions coming together to reconcile reference data or ticker symbols.
- In healthcare, a number of hospitals coming together to reconcile hospital records for patients.

![reconciliation diagram](data-reconciliation.png)

## Proposed solution

The CCF network will be used to host a reconciliation service where different parties with membership (banks and data providers) will be able to submit their own data to be reconciled against "each other's data" in a confidential manner without exposing the data to other members in the network.

The solution will use the voting process to reconcile members' data; on the data submission, when new record is submitted the app will check if it does not exist in the key-value store, it will be added; otherwise, a vote is added to this record with a member ID, and the vote will be "agree" if data attributes match; otherwise, it will "disagree."

This solution is generic to handle scenarios of data collaboration amongst different parties, and share reconciled results out on that data.

## Assumptions

- The application will accept data that conforms to the `agreed schema`
- The schema must has a unique identifier and attributes associated with this identifier
- The Data is compared across all members, no one source of truth
- In order for our app to provide a report on the data, ~80% of members need to have submitted their data
- If a record is determined to be out of consensus with other members in the network, you cannot share the value that other members had for that record (each member can only have access to their own reconciled records)

## Application

The reconciliation application will consist of three main services.

- Data ingestion
  - Accept single or batch of records
  - Accept data as CSV file format
- Data reconciliation
  - The voting concept will be used to reconcile data (all members submit their records as opinion)
  - Data is compared across all members, all members' data carry equal weight to reach consensus.
  - Reconciliation is on each record, not on the entire data set.
- Data reporting
  - API Endpoint: Members will query for results
    - Query by specific record by `a unique identifier`
    - Query all data

## Data flow

- Members will submit their own data records in accordance (`with the agreed schema`)
- Data will be processed and stored in key-value store, with members voting on each record
- For each member, a list of a reconciled records can be requested
- The data mapping and reference will depend on `a unique identifier`

![reconciliation-sample diagram](reconciliation-sample.png)

## Resources

- [Data reconciliation data schema](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-schema-data-flow.md)
- [Data validation and reconciliation](https://en.wikipedia.org/wiki/Data_validation_and_reconciliation)
- [What is data reconciliation?](https://www.guru99.com/what-is-data-reconciliation.html)
