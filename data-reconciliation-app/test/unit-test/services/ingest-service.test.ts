// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import "@microsoft/ccf-app/polyfill.js";
import * as jscrypto from "crypto";
import { DataRecord } from "../../../src/models/data-record";
import ingestService from "../../../src/services/ingest-service";

describe("Data Ingestion Service", () => {
  const userId = jscrypto.randomUUID();

  beforeEach(() => {});

  afterEach(() => {});

  test("Should ingest data successfully", () => {
    // Act
    const testDataRecords: DataRecord[] = [
      DataRecord.create({ key: "1", value: "test1" }).content!,
      DataRecord.create({ key: "2", value: "test2" }).content!,
      DataRecord.create({ key: "3", value: "test3" }).content!,
    ];
    // Assert
    const result = ingestService.submitData(userId, testDataRecords);
    // Assert
    expect(result).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.content).toBe("data has ingested successfully");
  });

  test("Should fail to ingest null data", () => {
    // Act
    const testDataRecords: DataRecord[] = null;

    // Assert
    const result = ingestService.submitData(userId, testDataRecords);

    // Assert
    expect(result.content).toBeNull();
    expect(result.failure).toBe(true);
  });

  test("Should fail to ingest empty data", () => {
    // Act
    const testDataRecords: DataRecord[] = [];

    // Assert
    const result = ingestService.submitData(userId, testDataRecords);

    // Assert
    expect(result.content).toBeNull();
    expect(result.failure).toBe(true);
  });
});
