// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import "@microsoft/ccf-app/polyfill.js";
import * as jscrypto from "crypto";
import { DataRecord } from "../../../src/models/data-record";
import ingestService from "../../../src/services/ingest-service";

describe("Data Ingestion Service", () => {
  const memberId = jscrypto.randomUUID();

  beforeEach(() => {});

  afterEach(() => {});

  test("Should ingest data successfully", () => {
    // Arrange
    const testDataRecords: DataRecord[] = [
      DataRecord.create({ key: "1", value: "test1" }).content!,
      DataRecord.create({ key: "2", value: "test2" }).content!,
      DataRecord.create({ key: "3", value: "test3" }).content!,
    ];

    // Act
    const result = ingestService.submitData(memberId, testDataRecords);

    // Assert
    expect(result).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.content).toBe("data has ingested successfully");
  });

  test("Should fail to ingest null data", () => {
    // Arrange
    const testDataRecords: DataRecord[] = null;

    // Act
    const result = ingestService.submitData(memberId, testDataRecords);

    // Assert
    expect(result.content).toBeNull();
    expect(result.failure).toBe(true);
  });

  test("Should fail to ingest empty data", () => {
    // Arrange
    const testDataRecords: DataRecord[] = [];

    // Act
    const result = ingestService.submitData(memberId, testDataRecords);

    // Assert
    expect(result.content).toBeNull();
    expect(result.failure).toBe(true);
  });
});
