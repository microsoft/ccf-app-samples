import { DataRecord, DataRecordMap } from "../models/data-record";
import { User } from "../models/user";
import { ServiceResult } from "../utils/service-result";
import { IKeyValueRepository } from "../repositories/kv-repository";
import { DataSchema, DataFieldSchema } from "../models/data-schema";
import * as ccfapp from "@microsoft/ccf-app";

export interface IIngestService {
  submitData(userId: string, dataRecords: DataRecord[]): ServiceResult<string>;
}

export class IngestService implements IIngestService {
  private keyValueRepo: IKeyValueRepository<DataRecordMap>;
  constructor(keyValueRepo: IKeyValueRepository<DataRecordMap>) {
    this.keyValueRepo = keyValueRepo;
  }

  // map and store data to kv-store
  public submitData(
    userId: User,
    dataRecords: DataRecord[]
  ): ServiceResult<string> {
    const recordsMap = this.convertToMap(dataRecords);
    this.keyValueRepo.set(userId, recordsMap);

    return ServiceResult.Succeeded("data has ingested successfully");
  }

  // map and store data to kv-store
  private convertToMap(dataRecords: DataRecord[]): DataRecordMap {
    const result = dataRecords.reduce(function (map, obj) {
      map[obj.key] = obj.value;
      return map;
    }, {});

    return result;
  }
}
