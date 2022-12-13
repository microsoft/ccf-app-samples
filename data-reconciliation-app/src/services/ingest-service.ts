import { DataRecord, NumericDataRecord, StringDataRecord, User } from "../models/data-record";
import { ServiceResult } from "../utils/service-result";
import { IKeyValueRepository } from "../repositories/kv-repository";
import { DataSchema, DataFieldSchema } from "../models/data-schema";

export interface IIngestService {
  submitData(userId: string, dataRecords: any[]): ServiceResult<string>;
}


export class IngestService implements IIngestService {
  private keyValueRepo: IKeyValueRepository<DataRecord>;
  private dataSchema: DataSchema;
  private keySchema: DataFieldSchema;
  private valueSchema: DataFieldSchema;

  constructor(keyValueRepo: IKeyValueRepository<DataRecord>) {
    this.keyValueRepo = keyValueRepo;
    this.dataSchema = this.getDataSchema();
    this.keySchema = this.dataSchema.key;
    this.valueSchema = this.dataSchema.value;
  }

  // map and store data to kv-store
  public submitData(userId: User, dataRecords: object[]): ServiceResult<string> {
    dataRecords.forEach((record) => {
      const mappedRecord = this.mapDataRecord(record, userId);
      if (this.keyValueRepo.has(mappedRecord.key)) {
        const existingRecord = this.keyValueRepo.get(mappedRecord.key);
        existingRecord.votes[userId] = mappedRecord.value;
        this.keyValueRepo.set(mappedRecord.key, existingRecord);
      } else {
        this.keyValueRepo.set(mappedRecord.key, mappedRecord);
      }
    });

    return ServiceResult.Succeeded("data has ingested successfully");
  }
  
  // map ingested data model to data-record model based on the schema
  private mapDataRecord(dataRecord: object, userId: User): DataRecord {
    let mappedRecord: DataRecord =
      this.valueSchema.type == "number"
        ? new NumericDataRecord()
        : new StringDataRecord();

    mappedRecord.key = dataRecord[this.keySchema.name];
    mappedRecord.value = dataRecord[this.valueSchema.name];
    mappedRecord.votes[userId] = mappedRecord.value;

    return mappedRecord;
  }

  // get data schema to mapped ingested data model
  private getDataSchema(): DataSchema {
    const schema: DataSchema = {
      key: { name: "id", type: "string" },
      value: { name: "value", type: "string" },
    };
    return schema;
  }
}
