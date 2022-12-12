# Investigate Data Structure and Sample data

Goal: Investigate data reconciliation sample app data flow, how we will reconcile this data in our application and potential sample data sets. We met with the Product Owner to discuss potential use of reference data as a test case for our sample application. While reference data may be a test case for our application, we will build the app to accept any data schema to extend to many reconciliation scenarios.

## Generic Data Reconcilition App = Many Use Cases

We will build our application for use across any data schemas. Pending legal approvals, reference data may be a test case for our app.

Main idea: We build a generalized sample app for a bunch of institutions who want to collaborate on some set of data, and share results out on that data.

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
- Stretch: Attribute types can be numerical as well.
- Stretch: Multiple attributes per unique id

## Data Schema Validation

Our main audience for our sample app is developers. A developer could take our sample app and extend it to their own use case. A developer could provide their input schema. Validation on the schema is not necessary for our app, but it could be a simple check:

- Yes, the data is in correct schema --> ingested into app
- No, not correct schema ---> Error: Try again.

## Data Ingest

- API Endpoint
  - Send single record
  - Send batch of records
- Data sent via CSV file

## Data Reconiliation

- Data is compared across all members carrying equal weight to reach the consensus. So, the source of truth doesn't rely on a single member or their data.
- In the forum app, there is a concept of 'voting' on a poll. In our application, we can think of voting as "did all the members submit data (or opinions) on the record?"
- Reconciliation is on each record, not on the entire data set.
- Please refer to [data-reconciliation.md](./data-reconciliation.md)

## Data Reporting

- API Endpoint: Members will query for results
  - Query by specific record (unique_id)
  - Query for all data
- In order for our app to provide a report on the data, a certain percentage of members need to have "voted" (or submited data) on a particular record. A `voting_threshold` may change based on the scenario and number of members. Therefore, we will make the `voting_threshold` configurable.
- For example, if `voting_threshold`=0.8,
  - Consortium of 5 members -> 4/5 members have to vote
  - Consortium of 3 members -> 2/3 members have to vote
- If a record is determined out of consensus with other members in the network, you cannot share the value of what other members had for that record.

## Data Results Schema

- MVP:

  - Results data is categorial - input data attribute value is a string, so status of attribute relative to network will be `in_consensus`, `lack_of_consensus`, or `not_enough_votes`.
  - Results data will be returned as JSON to each members.
  - Based on the member, table will look like:

    | unique_id | attribute_n                 | group_status                                                                                            | count_of_unique_values                               | members_in_agreement                                              | majority_minority                                                                     |
    | --------- | --------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
    | key       | attribute value you inputed | With respect to group, is my attribute value `in_consensus`, `lack_of_consensus`, or `not_enough_votes` | number of different atribute values inputed by group | number of members who agree with the attribute value you provided | are you in the majority or minority with the value provided? (`majority`, `minority`) |

- Stretch: Results data is a numerical summary
  - For example, instead of `my_status` being categorical, we would return the mean, std based on attribute value being numerical
  - This is not in scope...if it becomes in scope, we would need to define a table similar to the above
