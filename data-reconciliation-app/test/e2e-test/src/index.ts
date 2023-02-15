import Api, { ReportItem, Validator } from "./api.js";
import {
  member0DataPart1,
  csvDataWrongSchema,
  member0DataPart2,
  member1Data,
  member2Data,
} from "./data.js";
import https from "https";
import fs from "fs";
import inquirer from "inquirer";

const serverUrl = process.env.SERVER!;
const certificateStorePath = process.env.CERTS_FOLDER!;
const interactiveMode = process.env.INTERACTIVE_MODE!;

export interface DemoProps {
  ingestUrl: string;
  ingestCsvUrl: string;
  reportUrl: string;
  proposalUrl: string;
}

export interface DemoMemberProps {
  id: string;
  name: string;
  data: unknown;
  httpsAgent: https.Agent;
}

class Demo {
  //
  private static readonly demoProps: DemoProps = {
    ingestUrl: `${serverUrl}/app/ingest`,
    ingestCsvUrl: `${serverUrl}/app/csv/ingest`,
    reportUrl: `${serverUrl}/app/report`,
    proposalUrl: `${serverUrl}/gov/proposals`,
  };

  private static memberDataMap = new Map([
    ["0", member0DataPart1],
    ["1", member1Data],
    ["2", member2Data],
  ]);
  private static memberIds = ["0", "1", "2"];

  private static readonly members = Array<DemoMemberProps>();

  public static async start() {
    /**
     * Change working directory to the root of the project
     * All paths and process execution will be relative to root
     */
    process.chdir("../../");

    this.printTestSectionHeader(`🏁 Starting e2e Tests on server ${serverUrl}`);

    for (const memberId of this.memberIds) {
      const member = this.createMember(memberId);
      this.members.push(member);
    }

    this.printTestSectionHeader("🔬 [TEST]: Data Ingestion Service");

    console.log(`📝 Ingestion Service Validations...`);
    const dummyMember = this.createMember(this.memberIds[0]);
    dummyMember.data = csvDataWrongSchema;
    await Validator.validateRequest({
      url: this.demoProps.ingestCsvUrl,
      method: "POST",
      member: dummyMember,
      expectedStatus: 400,
      testMessage: "CSV data ingest failed (wrong schema)",
    });
    dummyMember.data = member0DataPart2;
    await Validator.validateRequest({
      url: this.demoProps.ingestCsvUrl,
      method: "POST",
      member: dummyMember,
      expectedStatus: 400,
      testMessage: "CSV data ingest failed (wrong file)",
    });
    dummyMember.data = [];
    await Validator.validateRequest({
      url: this.demoProps.ingestUrl,
      method: "POST",
      member: dummyMember,
      expectedStatus: 400,
      testMessage: "JSON data ingest failed (data length is zero)",
    });
    dummyMember.data = null;
    await Validator.validateRequest({
      url: this.demoProps.ingestUrl,
      method: "POST",
      member: dummyMember,
      expectedStatus: 400,
      testMessage: "JSON data ingest failed (data is null)",
    });
    console.log("---");

    // member 0 ingests data through CSV endpoint, members 1 & 2 through JSON
    console.log(`📝 Members Ingesting Data...`);
    await Api.ingest(this.demoProps.ingestCsvUrl, this.members[0]);
    await Api.ingest(this.demoProps.ingestUrl, this.members[1]);
    await Api.ingest(this.demoProps.ingestUrl, this.members[2]);

    await this.addCheckpoint("Ingestion Stage Complete");

    this.printTestSectionHeader(
      "🔬 [TEST]: Data Reporting Service (Full Report)"
    );

    for (const member of this.members) {
      await Api.report(this.demoProps, member);
    }

    await this.addCheckpoint("Full Reports Complete");

    this.printTestSectionHeader("🔬 [TEST]:Data Reporting Service (GetById)");

    console.log(`📝 Reporting Service Validations...`);
    await Validator.validateRequest({
      url: `${this.demoProps.reportUrl}/10`,
      method: "GET",
      member: dummyMember,
      expectedStatus: 400,
      testMessage: "Getting report by key_not_exist should fail",
    });
    console.log("---");

    let member = this.members[2];
    const id_inConsensus = "984500F5BD5BE5767C51";
    const id_notEnoughData = "984500BA57A56NBD3A24";
    const id_lackOfConsensus = "9845001D460PEJE54159";
    // group status for this key changes from LackOfConsensus to InConsensus during the demo
    const id_newGroupStatus = id_lackOfConsensus;

    console.log(`\n📝 --- IN CONSENSUS Example ---`);
    let reportItem = await Api.reportById(
      this.demoProps,
      member,
      id_inConsensus
    );
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "IN_CONSENSUS"
    );

    await this.addCheckpoint("IN_CONSENSUS DATA");

    console.log(`\n📝 --- NOT ENOUGH DATA Example ---`);
    reportItem = await Api.reportById(this.demoProps, member, id_notEnoughData);
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "NOT_ENOUGH_DATA"
    );

    await this.addCheckpoint("NOT_ENOUGH_DATA");

    console.log(`\n📝 --- LACK OF CONSENSUS Example ---`);
    reportItem = await Api.reportById(
      this.demoProps,
      member,
      id_lackOfConsensus
    );
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "LACK_OF_CONSENSUS"
    );

    await this.addCheckpoint("LACK_OF_CONSENSUS DATA");

    this.printTestSectionHeader("🔬 [TEST]: Report Changes");

    // new Ingestion for member 0 is through JSON
    member = this.members[0];
    member.data = member0DataPart2;
    console.log(`📝 ${member.name} Ingesting new Data...`);
    await Api.ingest(this.demoProps.ingestUrl, member);

    member = this.members[2];
    console.log(
      `📝 ${member.name} Data Status changes for id: ${id_newGroupStatus}...`
    );
    reportItem = await Api.reportById(
      this.demoProps,
      member,
      id_newGroupStatus
    );
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "IN_CONSENSUS"
    );

    await this.addCheckpoint("Updated Report after New Data Submission");

    this.printTestSectionHeader(
      "Test Suite - Assertion checks on report fields..."
    );

    let recordId = "984500F5BD5BE5767C51";
    console.log(
      `\nChecking ALL fields for ${member.name} and id ${recordId} (In Consensus)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "IN_CONSENSUS"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "majority_minority",
      "Majority"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "count_of_unique_values",
      1
    );
    this.assertReportField(member.name, reportItem, "members_in_agreement", 3);
    this.assertReportField(member.name, reportItem, "lei", recordId);
    this.assertReportField(member.name, reportItem, "nace", "C.18.13");

    // member2
    recordId = "9845002B6B074505A715";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (Not Enough Data with Minority of votes)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "NOT_ENOUGH_DATA"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "majority_minority",
      "Minority"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "count_of_unique_values",
      2
    );
    this.assertReportField(member.name, reportItem, "members_in_agreement", 1);

    // member2
    recordId = "984500BA57A56NBD3A24";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (Not Enough Data with Majority of votes)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "NOT_ENOUGH_DATA"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "majority_minority",
      "Majority"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "count_of_unique_values",
      1
    );
    this.assertReportField(member.name, reportItem, "members_in_agreement", 2);

    // member2
    recordId = "984500E1B2CA1D4EKG67";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (Lack of Consensus with Majority of votes)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(member.name, reportItem, "lei", recordId);
    this.assertReportField(member.name, reportItem, "nace", "A01.1");
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "LACK_OF_CONSENSUS"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "majority_minority",
      "Majority"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "count_of_unique_values",
      2
    );
    this.assertReportField(member.name, reportItem, "members_in_agreement", 2);

    member = this.members[0];
    recordId = "984500E1B2CA1D4EKG67";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (Lack of Consensus with Minority of votes)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(member.name, reportItem, "lei", recordId);
    this.assertReportField(member.name, reportItem, "nace", "A.01.1");
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "LACK_OF_CONSENSUS"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "majority_minority",
      "Minority"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "count_of_unique_values",
      2
    );
    this.assertReportField(member.name, reportItem, "members_in_agreement", 1);

    // member0
    recordId = "984500F5BD5BE5767C51";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (In Consensus)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "IN_CONSENSUS"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "majority_minority",
      "Majority"
    );
    this.assertReportField(
      member.name,
      reportItem,
      "count_of_unique_values",
      1
    );
    this.assertReportField(member.name, reportItem, "members_in_agreement", 3);

    member = this.members[1];
    recordId = "984500E1B2CA1D4EKG67";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (Lack of Consensus)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(member.name, reportItem, "lei", recordId);
    this.assertReportField(member.name, reportItem, "nace", "A01.1");
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "LACK_OF_CONSENSUS"
    );

    // member1
    recordId = "984500F5BD5BE5767C51";
    console.log(
      `\nChecking fields for ${member.name} and id ${recordId} (In Consensus)\n`
    );
    reportItem = await Api.reportById(this.demoProps, member, recordId);
    this.assertReportField(
      member.name,
      reportItem,
      "group_status",
      "IN_CONSENSUS"
    );

    this.printTestSectionHeader("🎉 All Tests Passed...");
  }

  private static assertReportField(
    memberName: string,
    reportItem: ReportItem,
    fieldName: string,
    expectedValue: string | number
  ) {
    const currentValue = reportItem[fieldName];
    if (currentValue == expectedValue) {
      console.log(
        `✅ [PASS] - Assert ${memberName}::${reportItem.lei}.${fieldName} == ${expectedValue}`
      );
    } else {
      throw new Error(
        `🛑 [TEST FAILURE]: Unexpected ${fieldName} for ${memberName}::${reportItem.lei} - Current: ${currentValue}. Expected: ${expectedValue}`
      );
    }
  }

  private static createMember(memberId: string): DemoMemberProps {
    return {
      id: memberId,
      name: `Member ${memberId}`,
      data: this.memberDataMap.get(memberId),
      httpsAgent: this.createHttpsAgent(memberId),
    };
  }

  private static createHttpsAgent(memberId: string): https.Agent {
    return new https.Agent({
      cert: fs.readFileSync(
        `${certificateStorePath}/member${memberId}_cert.pem`
      ),
      key: fs.readFileSync(
        `${certificateStorePath}/member${memberId}_privk.pem`
      ),
      ca: fs.readFileSync(`${certificateStorePath}/service_cert.pem`),
    });
  }

  private static printTestSectionHeader(title: string) {
    console.log("\n===============================================");
    console.log(`${title}`);
    console.log("===============================================");
  }

  private static async addCheckpoint(msg: string) {
    if (interactiveMode == "1") {
      console.log("\n");
      await inquirer.prompt([
        {
          name: msg,
          message: `🎬 ${msg}\n - Press return key to continue...`,
        },
      ]);
    }
  }
}

Demo.start();
