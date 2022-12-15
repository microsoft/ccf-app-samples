import { randomUUID } from "crypto";
import { DataRecord } from "../../../src/models/data-record";
import { ReconciledRecord } from "../../../src/models/reconciled-record";

describe("Reconciled Record Model", () => {
  test("Should Create", () => {
    // Arrange
    const userId = randomUUID();
    const dataRecord = DataRecord.create({
      key: randomUUID(),
      value: "Test Value",
    }).content!;

    // Act
    const createReconcRecord = ReconciledRecord.create(dataRecord, userId);
    const reconRecord = createReconcRecord.content;

    // Assert
    expect(reconRecord).not.toBeNull();
    expect(reconRecord?.key).toBe(dataRecord.key);
    expect(reconRecord?.values[userId]).toBe(dataRecord.value);
  });

  test("Should Update", () => {
    // Arrange
    const userId = randomUUID();
    const dataRecord = DataRecord.create({
      key: randomUUID(),
      value: "Test Value",
    })?.content!;

    // Act
    const createReconRecord = ReconciledRecord.create(dataRecord, userId)
      .content!;
    const updateDataRecord = DataRecord.create({
      key: dataRecord.key,
      value: "Updated Test Value",
    }).content!;
    const updateReconRecord = ReconciledRecord.update(
      createReconRecord,
      updateDataRecord,
      userId
    ).content;

    // Assert
    expect(updateReconRecord).not.toBeNull();
    expect(updateReconRecord?.key).toBe(dataRecord?.key);
    expect(updateReconRecord?.values[userId]).toBe(updateDataRecord?.value);
  });
});
