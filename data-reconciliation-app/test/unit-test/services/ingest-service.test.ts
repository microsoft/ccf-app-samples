import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
import * as jscrypto from "crypto";
import { ingestService } from "../../../src/utils/dependencies";
import { DataRecord } from "../../../src/models/data-record";

describe("Data Ingestion Service", () => {
  const userId = jscrypto.randomUUID();

  beforeEach(() => {});

  afterEach(() => {});

  test("Should ingest data successfully", () => {
    // Act
    const testDataRecords: DataRecord[] = [
      DataRecord.create("1", "test1"),
      DataRecord.create("2", "test2"),
      DataRecord.create("3", "test3"),
    ];

    // Assert
    const result = ingestService.submitData(userId, testDataRecords);

    // Assert
    expect(result).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.content).toBe(testDataRecords);
  });

  test("Should ingest empty data successfully", () => {
    // Act
    const testDataRecords: DataRecord[] = [];

    // Assert
    const result = ingestService.submitData(userId, testDataRecords);

    // Assert
    expect(result).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.content).toBe(testDataRecords);
  });
});
