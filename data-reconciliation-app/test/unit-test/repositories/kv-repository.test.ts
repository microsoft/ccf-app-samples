import * as polyfill from "@microsoft/ccf-app/polyfill.js";

import * as jscrypto from "crypto";
import {
  IKeyValueRepository,
  KeyValueRepository,
} from "../../../src/repositories/kv-repository";
import { DataRecord } from "../../../src/models/data-record";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";

describe("Key value pair Repository", () => {
  let keyValueRepo: IKeyValueRepository<DataRecord>;
  const userId = jscrypto.randomUUID();
  const testKey = jscrypto.randomUUID();
  const testDataRecord: DataRecord = DataRecord.create(testKey, "test");

  beforeEach(() => {
    keyValueRepo = new KeyValueRepository<DataRecord>();
  });

  afterEach(() => {});

  test("Should add a new key-value pair", () => {
    // Act

    // Assert
    const result = keyValueRepo.set(testKey, testDataRecord);

    // Assert
    expect(result).not.toBeNull();
    expect(result.value).toBe(testDataRecord.value);
    expect(result.type).toBe(testDataRecord.type);
  });

  test("Should retrieve key-value pair", () => {
    // Arrange
    // Act
    const result = keyValueRepo.get(testKey);

    // Assert
    expect(result).not.toBeNull();
    expect(result.value).toBe(testDataRecord.value);
    expect(result.type).toBe(testDataRecord.type);
  });

  test("Should update key-value pair", () => {
    // Arrange
    const newTestDataRecord: DataRecord = DataRecord.create(testKey, "test 2");

    keyValueRepo?.set(testKey, newTestDataRecord);

    // Act
    const result = keyValueRepo?.get(testKey);

    // Assert
    expect(result).not.toBeNull();
    expect(result.value).toBe(newTestDataRecord.value);
    expect(result.type).toBe(newTestDataRecord.type);
  });
});
