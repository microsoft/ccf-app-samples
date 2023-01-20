# Data Reconciliation Logic

## Status

Proposed

## Context

Once data is ingested into the app, Members/Users will query for the data to be reconciled against others.

## Requirements

- Reconciliation is on each record.
- Reconciled information will apply only to items for which a user has submitted data.
- When a user requests for Reconciliation Report, logic on the current dataset stored in the network is executed for this user.
- Result will not present other Users' information on a specific record, but just a comparison with them.

## When Reconciliation Happens

This logic will be embedded in the reporting API, and anytime a member asks for their data to be reconciled (asks for a report), the application will do the necessary calculations based on the data this member has ingested.

With this approach, Data Ingestion will be decoupled from any rules related to Reporting/Reconciliation.

This will be done by querying the KV Store for the keys a user has submitted data for. Data related to keys that are unknown to this user will not be present in the final report and will not be considered for reconciliation. Therefore, the reconciled data they get is only related to their submitted information.

## Scenarios

### Querying for a Specific Record

Users may want to reconcile a specific record. This will be accomplished by directly querying the record in the KV Storage and comparing the user's value to others.

Checks will be done if the user has submitted this specific record.

### Querying for all Data

Users may want to reconcile all the data they submitted. This will be accomplished by scanning the KV Storage, identifying the records this User has submitted, and applying the same comparison logic as for a specific record.

## Rules

**Current User:** The User requesting a reconciled report.

Each record will have all members' opinions on it. So, for each record, the reconciliation will be performed by comparing the current user's opinion to others'.

### KV Storage: Simple Map Based on Keys

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

Reconciliation logic is considered only if a specified number of opinions for a record are submitted. The `voting_threshold` determines if the record has received enough opinions to be reconciled. This will be configurable and can be set by members of the network, depending on the size of the network.

### For each record in the KV Storage

The first thing to look for is whether the current User has submitted an opinion for this record. If not, this record will be skipped right away.

If we have an opinion, then reconciliation can have three possible states:

- `NOT_ENOUGH_DATA` : If number of opinions does not reach `voting_threshold`.
- `LACK_OF_CONSENSUS`: If the threshold is met and at least one of the submitted opinions differs from all of the others.
- `IN_CONSENSUS`: If the threshold is met and all the opinions submitted are the same.

This state will come under the `group_status` field in the final Report.

### Sample Summary Result Schema and Report Mapping

In addition to `group_status`, additional statistics will be retrieved for the record to be later consolidated in the Report:

- Total number of opinions (useful for reporting but will not be made public)
- Number of unique opinions (count of different opinions for the record)
- Number of members that agree with the current user
- If the member's opinion is in accordance with the majority or minority of votes

Information will be consolidated into a Summary Result object that will be used by the Reporting API.
The following proposed schema represents a reconciled record. The output Report will then be generated based on this data.

```json
{
  "key": "<record key>",
  "value": "<value informed by User>",
  "group_status": "<value>",
  "total_votes_count": "#",                 // total opinions count - initially commented (DEMO CHANGE)
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
voting_threshold = // specified threshold value required for our calculations

key = record.key;

value = record.values[userId]

// Number of opinions
total_votes_count = record.values.length

// removing duplicates from Users opinions
count_of_unique_values = (new Set(Object.values(record.values))).length

// Filtering all votes that are similar to the current user
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
ATTRIBUTE_N           |value                  | Value submitted by User
GROUP_STATUS          |group_status           | Reconciliation result
UNIQUE_VALUES         |count_of_unique_values | Number of Distinct values submitted for this record
MEMBERS_IN_AGREEMENT  |members_in_agreement   | Number of members with same data as User
MINORITY_MAJORITY     |majority_minority      | Comparison between agreement total votes

## Pseudo Code

Please refer to [Data Reconciliation - Pseudo Code](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-reconciliation.md#pseudo-code)

## Resources

- [Data Reconciliation in the Project Context](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-reconciliation.md)
- [Data Schema Data Flow](https://github.com/microsoft/ccf-app-samples/blob/main/data-reconciliation-app/docs/data-schema-data-flow.md)
