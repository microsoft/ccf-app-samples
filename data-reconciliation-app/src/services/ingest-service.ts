import { DataRecord } from "../models/data-record";
import { User } from "../models/user";
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
  public submitData(
    userId: User,
    dataRecords: object[]
  ): ServiceResult<string> {
    dataRecords.forEach((record) => {
      if (this.hasValidSchema(record)) {
        const mappedRecord = this.mapDataRecord(record, userId);
        if (this.keyValueRepo.has(mappedRecord.key)) {
          const existingRecord = this.keyValueRepo.get(mappedRecord.key);
          existingRecord.votes[userId] = mappedRecord.value;
          this.keyValueRepo.set(mappedRecord.key, existingRecord);
        } else {
          this.keyValueRepo.set(mappedRecord.key, mappedRecord);
        }
      }
    });

    return ServiceResult.Succeeded("data has ingested successfully");
  }

  // map ingested data model to data-record model based on the schema
  private mapDataRecord(dataRecord: object, userId: User): DataRecord {
    const key: string = dataRecord[this.keySchema.name];
    const value: string | number = dataRecord[this.valueSchema.name];
    return DataRecord.create(key, value, userId);
  }

  private hasValidSchema(dataRecord: object): boolean {
    return (
      dataRecord.hasOwnProperty(this.keySchema.name) &&
      dataRecord.hasOwnProperty(this.valueSchema.name)
    );
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
