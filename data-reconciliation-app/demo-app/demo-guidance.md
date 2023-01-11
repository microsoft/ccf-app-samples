# Data Reconciliation Demo

In the long term, the product team would like to put a UI on top of our sample that shows off how easy it is to deploy a mCCF network and highlight mCCF’s governance capabilities.

However for our demo, we will aim to deliver the below demo via the command-line (APIs, no UI) as well as JSON, not CSV.

## Data

We will be demoing a reference data set where lei as a unique identifier and nace codes as the attributes.

We have sample sets [here](./data/) for the FSI Demo. Brent will provide real data sets in January (1,000-10,000 records).

## Part 1: Deploy and reconcile data

1. Deploy data reconciliation
   - Inputs: Constitution, Activate initial n members (certs), Initial App​ deployed
   - Output: mCCF network running latest build of reconciliation app, default constitution, 3 members have equal votes on decision, unanimous approval to advance proposals.
2. [Member 1](./data/member0_demo_pt1.json), [Member 2](./data/member2_demo.json) & [Member 3](./data/member3_demo.json) upload their data (JSON)
3. Each member queries for their data report (JSON returned)

## Part 2: Change in data

5. [Member 1](./data/member0_demo_pt2.json) uploads a small change to the existing dataset (JSON)
6. Members 1, 2, 3 are able to see the change in their respective reports

## Part 3: Code update

7. Member 1 submits proposal of code change to the network​ to expose some additional data
   - We will demo adding a another field (`total_vote_count`) to our reporting object. `total_vote_count` is the number of members who submitted data on that data record.
8. Member 2 & 3 approve the proposal​
9. Member 2 views updated report with additional data (`total_vote_count`) added by the proposal

## Reference

What will this demo look like? For reference, ![here](../docs/images/data_recon_sample.png) is an simplified example (2 members, smaller, simplified data set).
