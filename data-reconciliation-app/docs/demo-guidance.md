# Data Reconciliation Demo

In the future, this demo could have a UI to demonstrate how easy it is to deploy a mCCF network and highlight mCCF’s governance capabilities. However this demo will be via the command-line.

We will be demonstrating a reference data set where lei as a unique identifier and nace codes as the attributes. You can explore the data set [here](../test/data-samples/).

## Getting started

This demo can work against the Sandbox or CCF running in a docker image with very little ceremony. As long as you have a terminal in the `data-reconciliation-app` path, you can run `make demo` to run in the Sandbox, or `make demo-docker` to run in a virtual enclave inside docker.

If you wish to run this in Managed CCF, please see the [Managed CCF Demo Guidance](./managed-ccf-demo-guidance.md).

## Part 1: Startup

Start the demo by running `make demo` or `make demo-docker` in the `data-reconciliation-app` path.

This part of the demo has started the network and deployed the app. The network is running with 3 members and 1 user, and the app is deployed with the constitution defined [here](../governance/constitution/), which means that all members have equal votes on decisions, and a majority of approval votes is required to advance proposals. All members have been activated.

```bash
▶️ Starting sandbox...
💤 Waiting for sandbox . . . (23318)
📂 Working directory (for certificates): ./workspace/sandbox_common
💤 Waiting for the app frontend...
```

## Part 2. Ingestion

After you press any key, we will start the ingestion service. This service is a simple REST API that accepts JSON/CSV data. You can ingest data for a particular member, and the data will be stored in the network. There are a few negative test cases demonstrated as well as ingesting different file formats. At this point of the demo you will be asked to press any key to continue.

```bash
  -------- Test Ingestion Service --------  

✅ [Pass]: member0 - CSV data ingest failed (wrong file)
✅ [Pass]: member0 - CSV data ingest failed (wrong schema)
✅ [Pass]: member0 - CSV data ingest succeeded
 ---
✅ [Pass]: member1 - JSON data ingest failed (data length is zero)
✅ [Pass]: member1 - JSON data ingest failed (data is null)
✅ [Pass]: member1 - JSON data ingest succeeded
 ---
✅ [Pass]: member2 - JSON data ingest succeeded
🎬 Ingestion Stage Complete
```

## Part 3. Reporting Service (Full Report)

The next part of the demo will show the reporting service. This service is a simple REST API that returns a report of the data that has been ingested. Here we demonstrate retrieving a full report of all of the ingested data for that member. At this point of the demo you will be asked to press any key to continue.

```bash
-------- Test Reporting Service (Full Report) --------  

✅ [Pass]: user0 - Getting report without ingesting data should fail as 'No Data to Report' 
✅ [Pass]: member0 - Getting all data records should succeed
✅ [Pass]: member1 - Getting all data records should succeed
✅ [Pass]: member2 - Getting all data records should succeed

member1 Full Report:
{
  "group_status": "LACK_OF_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 2,
  "members_in_agreement": 2,
  "lei": "984500E1B2CA1D4EKG67",
  "nace": "A01.1"
}
{
  "group_status": "LACK_OF_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 2,
  "members_in_agreement": 2,
  "lei": "9845001D460PEJE54159",
  "nace": "K.65.12"
}
{
  "group_status": "IN_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 1,
  "members_in_agreement": 3,
  "lei": "254900Z8QM2AR51H5I26",
  "nace": "C.10.1"
}
{
  "group_status": "IN_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 1,
  "members_in_agreement": 3,
  "lei": "984500F5BD5BE5767C51",
  "nace": "C.18.13"
}
{
  "group_status": "LACK_OF_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 2,
  "members_in_agreement": 2,
  "lei": "9845005E5AEEB78CE366",
  "nace": "G.46.19"
}
{
  "group_status": "IN_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 1,
  "members_in_agreement": 3,
  "lei": "984500815D6139D53E23",
  "nace": "M.69.1"
}
{
  "group_status": "LACK_OF_CONSENSUS",
  "majority_minority": "Majority",
  "count_of_unique_values": 2,
  "members_in_agreement": 2,
  "lei": "984500UF3DE41EFA7F02",
  "nace": "B.08.9"
}

🎬 Full Reports Complete
```

## Part 4. Reporting Service (By Id) - IN CONSENSUS

This next section of the demo is retrieving reports by a specific id. This is a simple REST API that returns a report of the data that has been ingested. Here we demonstrate retrieving an IN_CONSENSUS record , that all members agree on the value of that particular key. At this point of the demo you will be asked to press any key to continue.

```bash
-------- Test Reporting Service (GetById) --------  

✅ [Pass]: member2 - Getting report by key_not_exist should fail
✅ [Pass]: member2 - Getting report by key should succeed

member2 - In Consensus GroupStatus Example: id: 984500F5BD5BE5767C51
{
  "content": {
    "group_status": "IN_CONSENSUS",
    "majority_minority": "Majority",
    "count_of_unique_values": 1,
    "members_in_agreement": 3,
    "lei": "984500F5BD5BE5767C51",
    "nace": "C.18.13"
  }
}
🎬 IN_CONSENSUS DATA
```

## Part 5. Reporting Service (By Id) - NOT_ENOUGH_DATA

This example demonstrates the result if not all members have submitted data for a particular key. At this point of the demo you will be asked to press any key to continue.

```bash
member2 - Not Enough Data GroupStatus Example: id: 984500BA57A56NBD3A24
{
  "content": {
    "group_status": "NOT_ENOUGH_DATA",
    "majority_minority": "Majority",
    "count_of_unique_values": 1,
    "members_in_agreement": 2,
    "lei": "984500BA57A56NBD3A24",
    "nace": "G.46.77"
  }
}
🎬 NOT_ENOUGH_DATA
```

## Part 6. Reporting Service (By Id) - LACK_OF_CONSENSUS

And this example shows the result when the members do not agree on the value for a particular key.

```bash
member2 - Lack of Consensus GroupStatus Example: id: 9845001D460PEJE54159
{
  "content": {
    "group_status": "LACK_OF_CONSENSUS",
    "majority_minority": "Majority",
    "count_of_unique_values": 2,
    "members_in_agreement": 2,
    "lei": "9845001D460PEJE54159",
    "nace": "K.65.12"
  }
}
🎬 LACK_OF_CONSENSUS DATA
```

## Part 7. Ingesting more data

To show how data ingestion can affect all members' reports, we can ingest more data and then re-run the report. We demonstrate this here with `member0` ingesting some new data and `member2` asking for a report for the same key as in the previous step. You can see that *group_status* has changed from `LACK_OF_CONSENSUS` to `IN_CONSENSUS`.

```bash
  -------- Report Change --------  

✅ [Pass]: member0 - JSON data ingest succeeded
🎬 member0 successfully ingested additional/updated data.

member2 - Data status changes for id: 9845001D460PEJE54159:
{
  "content": {
    "group_status": "IN_CONSENSUS",
    "majority_minority": "Majority",
    "count_of_unique_values": 1,
    "members_in_agreement": 3,
    "lei": "9845001D460PEJE54159",
    "nace": "K.65.12"
  }
}
🎬 Updated Report after New Data Submission
```

## Part 8. Running a test suite

The last part of the demo is running a test suite. This is a simple script that runs a series of tests against the REST API. The tests are designed to show the various states of the data and the reporting service.

## Part 9. Optional Code Change

The main part of the demo is complete. However, if you would like to see how you could handle a code change with CCF, then you can also follow this optional [demo](./managed-ccf-demo-guidance.md)
