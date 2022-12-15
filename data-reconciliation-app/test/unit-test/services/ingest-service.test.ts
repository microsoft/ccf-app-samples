// TODO: need to use ccf polyfill to solve the issue of key-value map with unit-test
// import "@microsoft/ccf-app/polyfill";

import * as jscrypto from "crypto";
import { DataRecord } from "../../../src/models/data-record";
import ingestService from "../../../src/services/ingest-service";

describe("Data Ingestion Service", () => {
  const userId = jscrypto.randomUUID();

  beforeEach(() => {});

  afterEach(() => {});

  test("Should ingest data successfully", () => {
    // // Act
    // const testDataRecords: DataRecord[] = [
    //   DataRecord.create({key:"1", value: "test1"}).content!,
    //   DataRecord.create({key:"2", value: "test2"}).content!,
    //   DataRecord.create({key:"3", value: "test3"}).content!,
    // ];
    // // Assert
    // const result = ingestService.submitData(userId, testDataRecords);
    // // Assert
    // expect(result).not.toBeNull();
    // expect(result.success).toBe(true);
    // expect(result.content).toBe("data has ingested successfully");
  });

  // test("Should ingest empty data successfully", () => {
  //   // Act
  //   const testDataRecords: DataRecord[] = [];

  //   // Assert
  //   const result = ingestService.submitData(userId, testDataRecords);

  //   // Assert
  //   expect(result).not.toBeNull();
  //   expect(result.success).toBe(true);
  //   expect(result.content).toBe("data has ingested successfully");
  // });
});
