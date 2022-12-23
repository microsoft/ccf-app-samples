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
  "key": "A0129",
  "values": {
      "Member 1": "google",
      "Member 2": "alphabet",
      ...
      "Member N": "...",
    }
}
```

### Voting Threshold

Reconciliation logic is considered only if a specified number of opinions for a record is submitted. The `voting_threshold` determines if the record has received enough opinions to be reconciled. This will be configurable and can be set by members of the network, depending on the size of the network.

### For each record in the KV Storage

First check to be made is whether the current User has submitted an opinion for this record. If not, this record can and will be skipped straightaway.

If we have an opinion, then reconciliation can have 3 possible status:

- `NOT_ENOUGH_DATA` : If number of opinions does not reach `voting_threshold`.
- `LACK_OF_CONSENSUS`: If threshhold is met and data is not equal among all opinions.
- `IN_CONSENSUS`: If threshold is met and data is equal among all opinions.

**A single different record is already a reason for the result to be `LACK_OF_CONSENSUS`.**

This status is the one that will be reported as the `group_status` field in the final Report.

### Sample Summary Result Schema and Report Mapping

In addition to `group_status`, additional statistics will be retrieved for the record to be later consolidated in the Report:

- Total number of opinions (this number helps reporting but shall not be public)
- Number of unique opinions (count of different opinions for the record)
- Number of members that agree with the current User
- If the member's opinion is in accordance with the majority or minority of votes

Information will be consolidated in a Summary Result object that will be used by the Reporting API.
The following proposed schema represents a reconciled record. The output Report will then be generated based on this data.

```json
{
  "key": "<record key>",
  "value": "<value informed by User>",
  "group_status": "<value>",
  "total_votes_count": "#",                 // total opinions count - initially comented (DEMO CHANGE)
  "count_of_unique_values": "#",            // count of unique values
  "members_in_agreement": "#",              // # of members in agreement with the User value
  "majority_minority": "<calculated value>" // relative to the number of active members in the network
} 
```

Where:

```typescript
record = // current record being reconciled
userId = // user requesting reconciliation
totalUsersInNetwork = // number of users in the system
voting_threshold = // specified value for threshold needed for our calculations

key = record.key;

value = record.values[userId]

// Number of opinions
total_votes_count = record.values.length

// removing duplicates from Users opinions
count_of_unique_values = (new Set(Object.values(record.values)).length

// Filtering all similar votes to the current User
members_in_agreement = 
    Object.keys(record.values).filter(
        (key) => key != userId && record.values[key] == user_opinion
    ).length

// Defining reconciliation status
group_status = (total_votes_count/totalUsersInNetwork) < voting_threshold 
                ? 'NOT_ENOUGH_DATA'
                : (unique_opinions.size() != 1) ? 'LACK_OF_CONSENSUS' : 'IN_CONSENSUS'

// Majority/minority classification according to network
majority_minority = (members_in_agreement / totalUsersInNetwork) > 0.5 ? 'majority' : 'minority'

```
Report Column         | Object Mapping        | description 
----------------------|-----------------------|------------
KEY                   |key                    | Record Id
ATTRIBUTE_N           | value                 | Value submitted by User
GROUP_STATUS          |group_status           | Reconciliation result
UNIQUE_VALUES         |count_of_unique_values | Number of Distinct values submitted for this record
MEMBERS_IN_AGREEMENT  | members_in_agreement  | Number of members with same data as User
MINORITY_MAJORITY     | majority_minority     | Comparison between agreement total votes

## Pseudo Code

Please refer to [Data Reconciliation - Pseudo Code](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-reconciliation.md#pseudo-code)

## Resources

- [Data Reconciliation in the Project Context](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-reconciliation.md)
- [Data Schema Data Flow](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-schema-data-flow.md)
