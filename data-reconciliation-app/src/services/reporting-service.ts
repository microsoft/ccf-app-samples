import { DataRecord, User} from "../models/data-record";
import { ServiceResult } from "../utils/service-result";
import { IKeyValueRepository } from "../repositories/kv-repository";

export interface IReportingService {
  getData(userId: User): ServiceResult<DataRecord[]>;
}

export class ReportingService implements IReportingService {
  private keyValueRepo: IKeyValueRepository<DataRecord>;

  constructor(keyValueRepo: IKeyValueRepository<DataRecord>) {
    this.keyValueRepo = keyValueRepo;
  }

  public getData(userId: User): ServiceResult<DataRecord[]> {
    const values = this.keyValueRepo.values();
    return ServiceResult.Succeeded(values);
  }

}
