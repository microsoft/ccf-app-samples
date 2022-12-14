import { DataRecord, DataRecordMap } from "../models/data-record";
import { User } from "../models/user";
import { ServiceResult } from "../utils/service-result";
import { IKeyValueRepository } from "../repositories/kv-repository";
import { ReconciledRecord } from "../models/recon-record";

export interface IReportingService {
  getData(userId: User): ServiceResult<object>;
}

export class ReportingService implements IReportingService {
  private keyValueRepo: IKeyValueRepository<DataRecordMap>;

  constructor(keyValueRepo: IKeyValueRepository<DataRecordMap>) {
    this.keyValueRepo = keyValueRepo;
  }

  public getData(userId: User): ServiceResult<object> {
   
    const result = {};
    result[userId] = this.keyValueRepo.get(userId);
    return ServiceResult.Succeeded(result);
  }
}
