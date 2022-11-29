
# What is data reconciliation means in the context of the project?

## Overview 

### *Data reconciliation*

Data reconciliation (DR) is a term typically used to describe a verification phase during a data migration where the target data is compared against original source data to ensure that the migration architecture has transferred the data correctly.

Data Reconciliation important because it will address a range of issues such as:
- Missing records
- Missing values
- Incorrect values
- Duplicated records
- Badly formatted values
- Broken relationships across tables or systems

Here, are important reasons for using Data Reconciliation Process:

- The use of Data Reconciliation helps you for extracting accurate and reliable information about the state of industry process from raw measurement data.
- It also helps you to produces a single consistent set of data representing the most likely process operation.
- It also leads to inaccurate insight and issues with customer service.
Reconciliation of data is also important for enterprise-control integration.

![architecture diagram](data-reconciliation.png)

### *Reconciliation in finance*

Reconciliation in finance is the process of comparing different business entities, accounts, amounts, data points, etc. to find out if they are matching or to explain why there are differences between them.

## Business case: Legal entities data Reconciliation

In the last few years, regulatory legislation has enforced a unique Legal Entity Identifier (LEI) which allows all financial industry participants to standardize how they reference counter-parties and clients. This law has been the impetus for all financial industry participants to clean up their reference data and adopt this new identification system. It has been inefficient and expensive for industry participants to maintain reference data. These datasets are critical for trade processing, risk management and regulatory reporting and therefore a high degree of accuracy is required. Yet the only way to have certainty regarding their accuracy is constant review and refresh against authoritative sources of all data, an enormous and costly task

Rather than collaborating with data providers and hiring human resources to keep these LEIs in sync, financial industry participants could leverage confidential compute platforms to create a consortium network and reconciliation service to clean up all their reference data. This would improve data quality in a compliant and cost-effective way through industry collaboration.

## Proposed solution

The CCF network will be used to host a reconciliation service where different parties with membership (banks and data providers) will be able to submit their own data to be reconciled against "each other's data" in a confidential manner without exposing the data to other members in the network.

The data reconciliation in our solution will focus on addressing "incorrect values" and will use the `LEI (Legal Entity Identifier)` as the reference key.

### Assumptions

- The application will accept data that conforms to the agreed-upon schema.
- The data reconciliation will validate the legal entity attributes to address any discrepancies.
- If the legal entity's data does not match any of the other members, it is considered non-compliant (a discrepancy).

### Workflow

- Members will submit their data in accordance (`with the agreed schema`)
- A data reconciliation process will be executed based using LEI as reference
- For each member, a list of noncompliant legal entities can be requested
- The data mapping and reference will depend on `LEI (Legal Entity Identifier)` 

### Reconciliation application

The reconciliation application will consist of three main services.

- Data ingestion
- Data reconciliation 
- Discrepancies reporting

## Resources

- [https://www.guru99.com/what-is-data-reconciliation.html](https://www.guru99.com/what-is-data-reconciliation.html)

- [https://managedlei.com/blog/legal-entity-identification-data-mapping](https://managedlei.com/blog/legal-entity-identification-data-mapping)
