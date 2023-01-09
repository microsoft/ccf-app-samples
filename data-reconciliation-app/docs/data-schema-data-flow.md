# Investigate Data Structure and Sample data

Goal: Investigate data reconciliation sample app data flow, how we will reconcile this data in our application and potential sample data sets. We met with the Product Owner to discuss potential use of reference data as a test case for our sample application. While reference data may be a test case for our application, we will build the app to accept any data schema to extend to many reconciliation scenarios.

## Generic Data Reconcilition App = Many Use Cases

Main idea: We build a generalized sample app for a bunch of institutions who want to collaborate on some set of data, and share results out on that data.

There is likely going to be a UI on top of our ingest API...so we will treat our app like a backend system. Therefore, ingest and reporting APIs will use JSON.

## Data Input Schema

Requirements:

- Members will agree upon their schema in advance - the only requirement is that this schema has a unique idenifier and attributes associated with the unique identifier.
- MVP: Our idenitifier and attributes types will be strings.
- MVP: We will only handle one attribute in this data reconciliation app. For example:

  | unique_id | attribute_1 |
  | --------- | ----------- |
  | A001      | XX          |
  | A002      | XY          |
  | A003      | XZ          |

- TODO: Product Owner to provide initial sample data set

## Data Schema Validation

Our main audience for our sample app is developers. A developer could take our sample app and extend it to their own use case. A developer could provide their input schema. Validation on the schema is not necessary for our app, but it could be a simple check:

- Yes, the data is in correct schema --> ingested into app
- No, not correct schema ---> Error: Try again.

## Data Ingest

- API Endpoints
  - Send single record
  - Send batch of records
- Data sent via JSON

## Data Reconiliation

- Data is compared across all members carrying equal weight to reach the consensus. So, the source of truth doesn't rely on a single member or their data.
- In the forum app, there is a concept of 'voting' on a poll. In our application, we can think of voting as "did all the members submit data (or opinions) on the record?"
- Reconciliation is on each record, not on the entire data set.
- Please refer to [data-reconciliation.md](./data-reconciliation.md)

## Data Reporting

- API Endpoint: Each members will query for their reconciled data. We can only report out on data ingested by the member. Members/users can query by:
  - key on a specific record
  - all data
- In order for our app to provide a report on the data, a certain percentage of members need to have submited data on a particular record. A `voting_threshold` may change based on the scenario and number of members.
- `voting_threshold` should be configurable
- For example, if `voting_threshold`=0.8,
  - Consortium of 5 members -> 4/5 members have to vote
  - Consortium of 3 members -> 2/3 members have to vote
- If a record is determined out of consensus with other members in the network, you cannot share the value of what other members had for that record.

## Data Results Schema

- MVP:

  - Each record has a `group_status`. Based on reconciliation logic, this status will be `in_consensus`, `lack_of_consensus`, or `not_enough_votes`.
  - Results data is by each member, and we can only report on the data (keys) submitted by that specific member.
  - Based on the member, a report table would look like:

    | unique_id | attribute_n                 | group_status                                                                                            | count_of_unique_values                               | members_in_agreement                                              | majority_minority                                                                     |
    | --------- | --------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
    | key       | attribute value you inputed | With respect to group, is my attribute value `in_consensus`, `lack_of_consensus`, or `not_enough_votes` | number of different atribute values inputed by group | number of members who agree with the attribute value you provided | are you in the majority or minority with the value provided? (`majority`, `minority`) |

  - We will not return an actual table or CSV. Rather, all of the data points above will be represented in JSON and returned via the reporting APIs.
  - The Product Owner specifically chose the column names above, so we must ensure similar language is represented in the returned JSON.
