import { randomUUID } from "crypto";
import { DataRecord, DataRecordProps } from "../../../src/models/data-record";

describe("Data Record Model", () => {
  test("Should Create", () => {
    // Arrange
    const props: DataRecordProps = {
      key: randomUUID(),
      value: "Test Value",
    };

    // Act
    const createDataRecord = DataRecord.create(props);
    const dataRecord = createDataRecord.content;

    // Assert
    expect(dataRecord).not.toBeNull();
    expect(dataRecord?.key).toBe(props.key);
    expect(dataRecord?.value).toBe(props.value);
    expect(dataRecord?.type).toBe(typeof props.value);
  });

  test("Should fail to create with empty key", () => {
    // Arrange
    const props: DataRecordProps = {
      // @ts-ignore
      key: null,
      value: "Test Value",
    };

    // Act
    const createDataRecord = DataRecord.create(props);

    // Assert
    expect(createDataRecord.content).toBeNull();
    expect(createDataRecord.error).not.toBeNull();
    expect(createDataRecord.error?.errorType).toBe("InvalidRecordKey");
    expect(createDataRecord.error?.errorMessage).toBe(
      "Error: key cannot be null or empty"
    );
  });

  test("Should fail to create with empty value", () => {
    // Arrange
    const props: DataRecordProps = {
      key: randomUUID(),
      value: "",
    };

    // Act
    const createDataRecord = DataRecord.create(props);

    // Assert
    expect(createDataRecord.content).toBeNull();
    expect(createDataRecord.error).not.toBeNull();
    expect(createDataRecord.error?.errorType).toBe("InvalidRecordValue");
    expect(createDataRecord.error?.errorMessage).toBe(
      "Error: value cannot be null or empty"
    );
  });
});
