// TODO: need to use ccf polyfill to solve the issue of key-value map with unit-test
import "@microsoft/ccf-app/polyfill.js";

import { randomUUID } from "crypto";
import { IRepository } from "../../../src/repositories/kv-repository";
import { ReconciledRecord } from "../../../src/models/reconciled-record";
import { DataRecord } from "../../../src/models/data-record";

describe("Key value pair Repository", () => {
  let keyValueRepo: IRepository<ReconciledRecord>;
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

  beforeEach(() => {
    //keyValueRepo = new KeyValueRepository<ReconciledRecord>(kvStore);
  });

  afterEach(() => {});

  test("Should add a new key-value pair", () => {
    // // Act
    // // Assert
    // const result = keyValueRepo.set(testKey, testReconRecord);
    // // Assert
    // expect(result).not.toBeNull();
    // expect(result.key).toBe(testReconRecord.key);
    // expect(result.values).toBe(testReconRecord.values);
  });

  // test("Should retrieve key-value pair", () => {
  //   // Arrange
  //   // Act
  //   const result = keyValueRepo.get(testKey);

  //   // Assert
  //   expect(result).not.toBeNull();
  //   expect(result.key).toBe(testReconRecord.key);
  //   expect(result.values).toBe(testReconRecord.values);
  // });

  // test("Should update key-value pair", () => {
  //   // Arrange
  //   let newRecord: DataRecord = DataRecord.create({key: testKey, value: "test-update"}).content!;
  //   let newTestReconRecord: ReconciledRecord = ReconciledRecord.create(newRecord, userId).content!;

  //   keyValueRepo?.set(testKey, newTestReconRecord);

  //   // Act
  //   const result = keyValueRepo?.get(testKey);

  //   // Assert
  //   expect(result).not.toBeNull();
  //   expect(result.key).toBe(newTestReconRecord.key);
  //   expect(result.values).toBe(newTestReconRecord.values);
  // });
});
