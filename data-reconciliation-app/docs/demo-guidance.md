# (Draft) Data Reconciliation Demo

In the long term, the product team would like to put a UI on top of our sample that shows off how easy it is to deploy a mCCF network and highlight mCCF’s governance capabilities. 

However for our demo, we will aim to deliver the below demo via the command-line (APIs, no UI).  

## Deploy and reconcile data

1. Deploy data reconciliation
    - Inputs: Constitution, Activate initial n members (certs), Initial App​ deployed
    - Output: mCCF network running latest build of reconciliation app, default constitution, n members have equal votes on decision, unanimous approval to advance proposals.
2. Member A uploads their data (xls)
3. A-n members upload their data (xls)
4. Each member queries for their data report (xls returned) 
5. Member A uploads a small change to the existing dataset (xls)
6. Members A-n are able to see the change in their respective reports

## Code update

7. Code update made by Member A to expose some additional data (add a column with a total vote count?)​
    - TODO need more definition on what this update would look like once we have sample data set?
8. Member A submits proposal to the network​
9. Member B->n approve proposal​
10. Member B views updated report with additional data added in proposal
