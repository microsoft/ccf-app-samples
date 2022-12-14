import { DataAttributeType, DataRecord } from "./data-record";

export class DataFieldSchema {
  name: string;
  type: string;
}

export class DataSchema {

  key: DataFieldSchema
  value: DataFieldSchema;

  // map ingested data model to data-record model based on the schema
  static mapDataRecord(dataRecord: object, schema : DataSchema): DataRecord {
    const key: string = dataRecord[schema.key.name];
    const value: DataAttributeType = dataRecord[schema.value.name];
    return DataRecord.create(key, value);
  }

   // map ingested data-models to data-record model based on the schema
   static mapDataRecords(dataRecords: object[]): DataRecord[] {
    const schema = DataSchema.getDefaultDataSchema();
    const mappedRecords = dataRecords.map((item)=> DataSchema.mapDataRecord(item, schema))
    return mappedRecords;
  }

  private static hasValidSchema(dataRecord: object, schema : DataSchema): boolean {
    return (dataRecord.hasOwnProperty(schema.key.name) &&
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