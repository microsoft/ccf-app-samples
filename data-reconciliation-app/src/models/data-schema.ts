import { ServiceResult } from "../utils/service-result";
import { DataAttributeType, DataRecord } from "./data-record";

export class DataFieldSchema {
  name: string;
  type: string;
}

export class DataSchema {
  key: DataFieldSchema;
  value: DataFieldSchema;

  // map ingested data model to data-record model based on the schema
  static mapDataRecord(
    dataRecord: object,
    schema: DataSchema
  ): ServiceResult<DataRecord> {
    if (!dataRecord || !schema) {
      return ServiceResult.Failed({
        errorMessage: "Error: data record is null or empty",
        errorType: "InvalidInputFormat",
      });
    }

    if (!this.hasValidSchema(dataRecord, schema)) {
      return ServiceResult.Failed({
        errorMessage: "Error: invalid input schema",
        errorType: "InvalidInputFormat",
      });
    }

    const key: string = dataRecord[schema.key.name];
    const value: DataAttributeType = dataRecord[schema.value.name];
    return DataRecord.create({ key: key, value: value });
  }

  // map ingested data-models to data-record model based on the schema
  static mapDataRecords(dataRecords: object[]): ServiceResult<DataRecord[]> {
    if (!dataRecords || dataRecords.length == 0) {
      return ServiceResult.Failed({
        errorMessage: "Error: data records is null or empty",
        errorType: "InvalidInputFormat",
      });
    }

    const schema = DataSchema.getDefaultDataSchema();
    const mappedRecords: DataRecord[] = [];

    dataRecords.forEach((record) => {
      const mappedRecord = DataSchema.mapDataRecord(record, schema);
      if (mappedRecord.success) {
        mappedRecords.push(mappedRecord.content);
      }
    });
    return ServiceResult.Succeeded(mappedRecords);
  }

  // validate input object schema
  private static hasValidSchema(
    dataRecord: object,
    schema: DataSchema
  ): boolean {
    return (
      dataRecord.hasOwnProperty(schema.key.name) &&
      dataRecord.hasOwnProperty(schema.value.name)
    );
  }

  // get data schema to mapped ingested data model
  private static getDefaultDataSchema(): DataSchema {
    const schema: DataSchema = {
      key: { name: "id", type: "string" },
      value: { name: "value", type: "string" },
    };
    return schema;
  }
}
