# Data Reconciliation Logic

## Status

Proposed

## Context

Once data is ingested into the app, Members/Users will query for the data to be reconciled against others.


## Requirements
- Reconciliation is on each record.
- Reconciled information will apply only to items a User has submitted data for.
- Anytime a User requests a Reconciliation Report, Logic will be executed for this User on the current dataset stored in the network
- Result will not present other Users' information on a specific record, but just a comparison with them.

## When Reconciliation Happens

This logic will be embedded on the reporting API, and anytime a member asks for their data to be reconciled (ask for a report), the application will do the necessary calculations based on the data this member has entered.

With this approach, Data Ingestion will be detached from any rules related to Reporting/Reconciliation.

This will be done by querying the KV Store for the keys a User has submitted data for. Data related to keys that are unknown to this User will not be present in the final report, and not considered for reconciliation. Therefore the reconciled data they get is only related to their submitted information.

## Scenarios

### Querying for a Specific Record
Users may want to reconcile a specific record. This will be done by directly querying the record in the KV Storage, and comparing the value submitted by the User against others'.

Checks will be done if User has submitted this specific record.

### Querying for all Data
Users may want to reconcile all data they submitted. This will be done by scanning the KV Storage, identifying the records this User has submitted and the comparison logic will be the same used for a single record.

## Rules
**Current User:** The User requesting a reconciled report.

Each record will have all members' opinions for it. So for each record the reconciliation will be done by comparing the opinion of the current User against the other.

### KV Storage - Simple Map based on keys

```json
{
  "Key": "A0129",
  "Attribute": {
    "opinions": {
      "Member 1": "google",
      "Member 2": "alphabet",
      ...
      "Member N": "...",
    }
  }
}
```
### For each record in the KV Storage :
First check to be made is whether the current User has submitted an opinion for this record. If not, this record can and will be skipped straightaway.

If we have an opinion, then reconciliation can have 3 possible results:
- `NOT_ENOUGH_VOTES` : If number of votes does not reach the minimum threshold.
- `LACK_OF_CONSENSUS`: If threshhold is met and data is not equal among all opinions.
- `IN_CONSENSUS`: If threshold is met and data is equal among all opinions.

**A single different record is already a reason for the result to be `LACK_OF_CONSENSUS`.**

Statistics will be retrieved based on the votes for the record and later reported.
- Total number of opinions (this number helps reporting but shall not be public)
- Number of unique opinions
- Number of members that agree with the current User

Information will be consolidated in a Summary object that will be used by the Reporting API.

## Pseudo Code

Please refer to [Data Reconciliation - Pseudo Code](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-reconciliation.md#pseudo-code)


## Resources

- [Data Reconciliation in the Project Context](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-reconciliation.md)
- [Data Schema Data Flow](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-schema-data-flow.md)
