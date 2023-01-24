# Managed CCF Demo

It is possible to run these demos in a managed CCF environment. Currently, Managed CCF is in Preview and you will have to request access to the service. Please contact [CCF](https://microsoft.github.io/CCF/) for more information.

We supply a Code Tour of how you could deploy the samples to Managed CCF. You can find the Code Tour [here](../../.tours/deploy-code-change-on-mccf.tour). This document outlines the steps you would need to take to deploy the samples to Managed CCF.

## Step 1. Create a Managed CCF instance
The first step is to create a Managed CCF instance. You can do this from the portal or from the command line. Follow [this guide](../../deploy/README.md) to create a Managed CCF instance.

## Step 2. Run the tests
All of the tests supplied in this sample work on all of the CCF networks. In this example you need to run `make test-mccf` to run the tests against the Managed CCF instance. This will configure the network with the correct constitution and ingest data into the network and then query the network to ensure the data is correct.

## Step 3. Update the code
We have supplied a commented out piece of code on Line 80 of [data-schema.ts](../src/models/data-schema.ts#L80); uncomment this.

```TypeScript
    //total_votes_count: summaryRecord.votesCount
```

## Step 4. Run the extra demo
Now we can redeploy that code to the network and run the extra demo. Run `make demo-code-change` again and you will see a new application proposal being submitted and a new element being returned in the summary report.
