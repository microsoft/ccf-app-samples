// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import "@microsoft/ccf-app/polyfill.js";

import { randomUUID } from "crypto";
import keyValueRepository, {
  IRepository,
} from "../../../src/repositories/kv-repository";
import { ReconciledRecord } from "../../../src/models/reconciled-record";
import { DataRecord } from "../../../src/models/data-record";

describe("Key value pair Repository", () => {
  let keyValueRepo: IRepository<ReconciledRecord> = keyValueRepository;
  let userId = randomUUID();
  let testKey = randomUUID();
  let testRecord: DataRecord = DataRecord.create({
    key: testKey,
    value: "test",
  }).content!;

  let testReconRecord: ReconciledRecord = ReconciledRecord.create(
    testRecord,
    userId
  ).content!;

  beforeEach(() => {});
  afterEach(() => {});

  test("Should add a new key-value pair", () => {
    // Arrange
    // Act
    const result = keyValueRepo.set(testKey, testReconRecord);

    // Assert
    expect(result.content).not.toBeNull();
    expect(result.content.key).toBe(testReconRecord.key);
    expect(result.content.values).toBe(testReconRecord.values);
  });

  test("Should retrieve key-value pair", () => {
    // Arrange

    // Act
    const result = keyValueRepo.get(testKey);

    // Assert
    expect(result.content).not.toBeNull();
    expect(result.content.key).toBe(testReconRecord.key);
    expect(result.content.values[userId]).toBe(testReconRecord.values[userId]);
  });

  test("Should update key-value pair", () => {
    // Arrange
    let newRecord: DataRecord = DataRecord.create({
      key: testKey,
      value: "test-update",
    }).content!;
    let newTestReconRecord: ReconciledRecord = ReconciledRecord.create(
      newRecord,
      userId
    ).content!;

    keyValueRepo?.set(testKey, newTestReconRecord);

    // Act
    const result = keyValueRepo?.get(testKey);

    // Assert
    expect(result.content).not.toBeNull();
    expect(result.content.key).toBe(newTestReconRecord.key);
    expect(result.content.values[userId]).toBe(
      newTestReconRecord.values[userId]
    );
  });

  test("Should fail to retrieve a non-existent key", () => {
    // Arrange

    // Act
    const result = keyValueRepository.get("key1");

    // Assert
    expect(result.failure).toBe(true);
    expect(result.error.errorMessage).toBe("Error: key does not exist");
  });
});
