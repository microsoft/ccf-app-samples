import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";

export interface IReportingService {
  getData(userId: string): ServiceResult<object>;
}

export class ReportingService implements IReportingService {
  constructor(private readonly repository: IRepository<ReconciledRecord>) {}

  public getData(userId: string): ServiceResult<object> {
    const result = this.repository.values();
    return ServiceResult.Succeeded(result);
  }
}

const reportingService: IReportingService = new ReportingService(keyValueRepository);
export default reportingService;
