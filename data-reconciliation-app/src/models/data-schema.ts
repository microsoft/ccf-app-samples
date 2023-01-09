import { ServiceResult } from "../utils/service-result";
import { DataAttributeType, DataRecord } from "./data-record";
import { SummaryRecord } from "./summary-record";

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

  // map summary data model to report model based on the schema
  static mapSummaryRecord(
    summaryRecord: SummaryRecord,
    schema?: DataSchema
  ): ServiceResult<object> {
    if (!schema) {
      schema = DataSchema.getDefaultDataSchema();
    }
    const result = {
      group_status: summaryRecord.groupStatus,
      majority_minority: summaryRecord.minorityMajorityStatus,
      count_of_unique_values: summaryRecord.uniqueValuesCount,
      members_in_agreement: summaryRecord.membersInAgreementCount,
      //total_votes_count: summaryRecord.votesCount
    };

    result[schema.key.name] = summaryRecord.key;
    result[schema.value.name] = summaryRecord.value;

    return ServiceResult.Succeeded(result);
  }

  // map summary data models to report models based on the schema
  static mapSummaryRecords(
    summaryRecords: SummaryRecord[]
  ): ServiceResult<object[]> {
    const schema = DataSchema.getDefaultDataSchema();
    const results: object[] = [];
    if (summaryRecords && summaryRecords.length > 0) {
      summaryRecords.forEach((record) => {
        const mappedRecord = DataSchema.mapSummaryRecord(record, schema);
        if (mappedRecord.success) {
          results.push(mappedRecord.content);
        }
      });
    }
    return ServiceResult.Succeeded(results);
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

  // get data schema to map the ingested data model
  private static getDefaultDataSchema(): DataSchema {
    const schema: DataSchema = {
      key: { name: "lei", type: "string" },
      value: { name: "nace", type: "string" },
    };
    return schema;
  }
}
