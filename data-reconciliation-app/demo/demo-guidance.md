# (Draft) Data Reconciliation Demo

In the long term, the product team would like to put a UI on top of our sample that shows off how easy it is to deploy a mCCF network and highlight mCCF’s governance capabilities.

However for our demo, we will aim to deliver the below demo via the command-line (APIs, no UI) as well as JSON, not CSV.

## Deploy and reconcile data

1. Deploy data reconciliation
   - Inputs: Constitution, Activate initial n members (certs), Initial App​ deployed
   - Output: mCCF network running latest build of reconciliation app, default constitution, n members have equal votes on decision, unanimous approval to advance proposals.
2. Member A uploads their data (JSON)
   - TODO Brent to provide sample data set
3. A-n members upload their data (JSON)
4. Each member queries for their data report (JSON returned)
5. Member A uploads a small change to the existing dataset (JSON)
6. Members A-n are able to see the change in their respective reports

## Code update

7. Code update made by Member A to expose some additional data (add a column to the report tabe? For example, an another column with a total vote count)
8. Member A submits proposal of code change to the network​
9. Member B->n approve proposal​
10. Member B views updated report with additional data column added in proposal
