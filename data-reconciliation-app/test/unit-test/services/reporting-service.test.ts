// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import "@microsoft/ccf-app/polyfill.js";
import * as jscrypto from "crypto";
import { DataRecord } from "../../../src/models/data-record";
import ingestService from "../../../src/services/ingest-service";
import reportingService from "../../../src/services/reporting-service";

describe("Data Reporting Service", () => {
  const memberId1 = jscrypto.randomUUID();
  const memberId2 = jscrypto.randomUUID();
  const memberId3 = jscrypto.randomUUID();
  const memberId4 = jscrypto.randomUUID();

  const member1_DataRecords: DataRecord[] = [
    DataRecord.create({ key: "1", value: "test1" }).content,
    DataRecord.create({ key: "2", value: "test2" }).content,
    DataRecord.create({ key: "3", value: "test3" }).content,
  ];

  const member2_DataRecords: DataRecord[] = [
    DataRecord.create({ key: "1", value: "test1" }).content,
    DataRecord.create({ key: "2", value: "test2" }).content,
    DataRecord.create({ key: "3", value: "test3" }).content,
    DataRecord.create({ key: "4", value: "test4" }).content,
    DataRecord.create({ key: "5", value: "test5" }).content,
  ];

  const member3_DataRecords: DataRecord[] = [
    DataRecord.create({ key: "1", value: "test1" }).content,
    DataRecord.create({ key: "2", value: "test2" }).content,
    DataRecord.create({ key: "3", value: "test33" }).content,
    DataRecord.create({ key: "4", value: "test4" }).content,
    DataRecord.create({ key: "5", value: "test5" }).content,
  ];

  const member4_DataRecords: DataRecord[] = [
    DataRecord.create({ key: "1", value: "test1" }).content,
    DataRecord.create({ key: "2", value: "test2" }).content,
    DataRecord.create({ key: "3", value: "test3" }).content,
    DataRecord.create({ key: "4", value: "test4" }).content,
    DataRecord.create({ key: "5", value: "test55" }).content,
  ];

  beforeAll(() => {
    ingestService.submitData(memberId1, member1_DataRecords);

    ingestService.submitData(memberId2, member2_DataRecords);

    ingestService.submitData(memberId3, member3_DataRecords);

    ingestService.submitData(memberId4, member4_DataRecords);
  });

  test("Should get all data successfully", () => {
    // Arrange

    // Act
    const result = reportingService.getData(memberId1);

    // Assert
    expect(result.success).toBe(true);
    expect(result.content.length).toBe(member1_DataRecords.length);
  });

  test("Should get data record by key successfully", () => {
    // Arrange
    const comparisonRecord = member1_DataRecords[0];

    // Act
    const result = reportingService.getDataById(
      memberId1,
      comparisonRecord.key
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.content.key).toBe(comparisonRecord.key);
    expect(result.content.value).toBe(comparisonRecord.value);
    expect(result.content.type).toBe(comparisonRecord.type);
  });

  test("Should fail to get data record by key not exists in member data", () => {
    // Arrange
    const key_NotExist = "5";

    // Act
    const result = reportingService.getDataById(memberId1, key_NotExist);

    // Assert
    expect(result.failure).toBe(true);
    expect(result.error.errorMessage).toBe("Error: The key does not exist");
    expect(result.content).toBeNull();
  });

  test("Should fail to get data record by key that is null or empty", () => {
    // Arrange
    const key_Empty = "";

    // Act
    const result = reportingService.getDataById(memberId1, key_Empty);

    // Assert
    expect(result.failure).toBe(true);
    expect(result.error.errorMessage).toBe(
      "Error: key cannot be null or empty"
    );
    expect(result.content).toBeNull();
  });

  test("Should fail to get data for a member/user that did not ingest anything", () => {
    // Arrange
    const userId1 = jscrypto.randomUUID(); // user who does not ingest data but asks for a report

    // Act
    const result = reportingService.getData(userId1);

    // Assert
    expect(result.failure).toBe(true);
    expect(result.error.errorMessage).toBe("Error: No data to Report");
    expect(result.content).toBeNull();
  });
});
