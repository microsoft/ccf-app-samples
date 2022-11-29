# Investigate Data Structure and Sample data

Goal: Investigate data reconciliation sample app data flow, how we will reconcile this data in our application and potential sample data sets. We met with Brent to discuss potential use of LEI data as a test case for our sample application. While LEI may be a test case for our application, we will build the app to accept any data schema to extend to many reconciliation scenarios.


## Generic Data Reconcilition App = Many Use Cases
We will build our application for use across any data schemas. Pending legal approvals, LEI may be a test case for our app.

Main idea: We build a generalized sample app for a bunch of institutions who want to collaborate on some set of data, and share results out on that data. 

## Data Schema 
Assumption: In our sample application, members will agree upon their schema. The only requirement is that this schema has a unique idenifier and attributes associated with the unique identifier. 

Validation on the schema is not neccessary for our app, but it could be simple in our sample to check keys/attributes exist: 
- Yes, the data is in correct schema --> ingested into app
- No, not correct schema ---> Error: Try again. 

## Data Ingest 
- API Endpoint
    - Send single record 
    - Send batch of records
- Data sent via CSV file 

## Data Reconiliation
- Data is compared across all members. In the LEI scenario, the data provider is not the single source of truth and their data is not weighted differently. In theory, all members' data carry equal weight to reach consensus.
- In the forum app, there is a concept of 'voting' on a poll. In our application, we can think of voting as "did all the members submit data (or opinions) on the record?"
- Reconciliation is on each record, not on the entire data set. 

## Data Reporting
- In order for our app to provide a report on the data, ~ 80% of members need to have "voted" (or submited data) on a particular record. 
    - Consortium of 5 members -> 4/5 members have to vote
    - Consortium of 3 members -> 2/3 members have to vote
- API Endpoint: Members will query for results 
    - Query by specific record 
    - Query for all data 
- If a record is determined out of consensus with other members in the network, you cannot share the value of what other members had for that record. 
- Depending on the input data schema, results can be numerical or categorical and returned as a CSV table to all members.
    - For example, the forum app returned the mean and standard deviation based on the opinions (data) submitted by the members.
- For LEI data/categorical data, Results = CSV table of records in consensus, out of consensus, or undetermined, as well as number of folks in the network you are in or out of consensus with. Something along the lines of:
    - ID, Status, # Members Agreed, # Members did not agree
    - unqiue_id_1, IN_CONSENSUS, 5, 0
    - unique_id_2, OUT_OF_CONSENSUS, 3, 2
    - unique_id_3, NOT_ENOUGH_VOTES, 2, 1