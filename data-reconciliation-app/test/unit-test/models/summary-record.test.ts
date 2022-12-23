import { randomUUID } from "crypto";
import { ReconciledRecord } from "../../../src/models/reconciled-record";
import {
  SummaryGroupStatus,
  SummaryStatus,
  SummaryRecord,
} from "../../../src/models/summary-record";

describe("Summary Record Model", () => {
  const memberId1 = randomUUID();
  const memberId2 = randomUUID();
  const memberId3 = randomUUID();
  const memberId4 = randomUUID();
  const memberId5 = randomUUID();

  let reconRecord: ReconciledRecord = {
    key: randomUUID(),
    type: "string",
    values: {},
  };

  test("Should Create", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value";
    reconRecord.values[memberId2] = "Test Value";
    reconRecord.values[memberId3] = "Test Value";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.key).toBe(reconRecord.key);
    expect(summaryRecord.value).toBe(reconRecord.values[memberId1]);
    expect(summaryRecord.type).toBe(reconRecord.type);
    expect(summaryRecord.minorityMajorityStatus).toBe(SummaryStatus.Majority);
    expect(summaryRecord.groupStatus).toBe(SummaryGroupStatus.InConsensus);
    expect(summaryRecord.membersInAgreementCount).toBe(3);
    expect(summaryRecord.membersInDisagreementCount).toBe(0);
    expect(summaryRecord.votesCount).toBe(3);
    expect(summaryRecord.uniqueValuesCount).toBe(1);
  });

  test("Should return Status equal to 'Minority'", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value";
    reconRecord.values[memberId2] = "Test Value1";
    reconRecord.values[memberId3] = "Test Value1";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.minorityMajorityStatus).toBe(SummaryStatus.Minority);
  });

  test("Should return Status equal to 'Majority'", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value";
    reconRecord.values[memberId2] = "Test Value";
    reconRecord.values[memberId3] = "Test Value";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.minorityMajorityStatus).toBe(SummaryStatus.Majority);
  });

  test("Should return GroupStatus equal to 'InConsensus'", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value";
    reconRecord.values[memberId2] = "Test Value";
    reconRecord.values[memberId3] = "Test Value";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.groupStatus).toBe(SummaryGroupStatus.InConsensus);
  });

  test("Should return GroupStatus equal to 'LackOfConsensus'", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value";
    reconRecord.values[memberId2] = "Test Value";
    reconRecord.values[memberId3] = "Test Value3";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.groupStatus).toBe(SummaryGroupStatus.LackOfConsensus);
  });

  test("Should return GroupStatus equal to 'NotEnoughData'", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value1";
    reconRecord.values[memberId2] = "Test Value2";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.groupStatus).toBe(SummaryGroupStatus.NotEnoughData);
  });

  test("Should return the counts correctly", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId1] = "Test Value";
    reconRecord.values[memberId2] = "Test Value";
    reconRecord.values[memberId3] = "Test Value";
    reconRecord.values[memberId4] = "Test Value4";
    reconRecord.values[memberId5] = "Test Value5";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);
    const summaryRecord = createSummaryRecord.content;

    // Assert
    expect(summaryRecord.membersInAgreementCount).toBe(3);
    expect(summaryRecord.membersInDisagreementCount).toBe(2);
    expect(summaryRecord.votesCount).toBe(5);
    expect(summaryRecord.uniqueValuesCount).toBe(3);
  });

  test("Should fail with 'key does not exist'", () => {
    // Arrange
    reconRecord.values = {};
    reconRecord.values[memberId2] = "Test Value";
    reconRecord.values[memberId3] = "Test Value";

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);

    // Assert
    expect(createSummaryRecord.failure).toBe(true);
    expect(createSummaryRecord.error.errorMessage).toBe(
      "Error: The key does not exist"
    );
  });

  test("Should fail with 'key cannot be null or empty'", () => {
    // Arrange
    const newReconRecord = JSON.parse(JSON.stringify(reconRecord));
    newReconRecord.key = null;

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, newReconRecord);

    // Assert
    expect(createSummaryRecord.failure).toBe(true);
    expect(createSummaryRecord.error.errorMessage).toBe(
      "Error: key cannot be null or empty"
    );
  });

  test("Should fail with 'Error: Values can not be null or empty'", () => {
    // Arrange
    reconRecord.values = null;

    // Act
    const createSummaryRecord = SummaryRecord.create(memberId1, reconRecord);

    // Assert
    expect(createSummaryRecord.failure).toBe(true);
    expect(createSummaryRecord.error.errorMessage).toBe(
      "Error: values can not be null or empty"
    );
  });
});
