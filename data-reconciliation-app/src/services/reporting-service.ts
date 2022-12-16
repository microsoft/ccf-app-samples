import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";

export interface IReportingService {
  getData(userId: string): ServiceResult<object>;
}

export class ReportingService implements IReportingService {
  private keyValueRepo: IRepository<ReconciledRecord>;

  constructor(keyValueRepo: IRepository<ReconciledRecord>) {
    this.keyValueRepo = keyValueRepo;
  }

  public getData(userId: string): ServiceResult<object> {
    const result = this.keyValueRepo.values();
    return ServiceResult.Succeeded(result);
  }
}

const reportingService: IReportingService = new ReportingService(
  keyValueRepository
);
export default reportingService;
