# What is data reconciliation means in the context of the project?

## _Reconciliation in finance_

Reconciliation in finance is the process of comparing different business entities, accounts, amounts, data points, etc. to find out if they are matching or to explain why there are differences between them.

Data Reconciliation is important because it will address a range of issues such as:

- Missing records
- Missing values
- Incorrect values
- Duplicated records
- Badly formatted values
- Broken relationships across tables or systems

![reconciliation diagram](data-reconciliation.png)

## Use case

In the last few years, regulatory legislation has enforced a unique Legal Entity Identifier (LEI) which allows all financial industry participants to standardize how they reference counter-parties and clients. This law has been the impetus for all financial industry participants to clean up their reference data and adopt this new identification system. It has been inefficient and expensive for industry participants to maintain reference data. These datasets are critical for trade processing, risk management and regulatory reporting and therefore a high degree of accuracy is required. Yet the only way to have certainty regarding their accuracy is constant review and refresh against authoritative sources of all data, an enormous and costly task.

Rather than collaborating with data providers and hiring human resources to keep these LEIs in sync, financial industry participants could leverage confidential compute platforms to create a consortium network and reconciliation service to clean up all their reference data. This would improve data quality in a compliant and cost-effective way through industry collaboration.

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

- [https://www.guru99.com/what-is-data-reconciliation.html](https://www.guru99.com/what-is-data-reconciliation.html)

- [https://managedlei.com/blog/legal-entity-identification-data-mapping](https://managedlei.com/blog/legal-entity-identification-data-mapping)
