import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";
import { ISummaryRecord, SummaryRecord } from "../models/data-summary";

export interface IReportingService {
  getData(userId: string): ServiceResult<ISummaryRecord[]>;
  getDataById(userId: string, key: string): ServiceResult<ISummaryRecord>;
}

export class ReportingService implements IReportingService {

  constructor(private readonly repository: IRepository<ReconciledRecord>) {

  }

  // get reconciliation summary report for one user's data record
  getDataById(userId: string, key: string): ServiceResult<ISummaryRecord> {
    const record = this.repository.get(key);

    if (record.failure)
      return ServiceResult.Failed(record.error, record.statusCode);

    return SummaryRecord.create(userId, record.content);
  }

  // get reconciliation summary report for all user's data records
  public getData(userId: string): ServiceResult<ISummaryRecord[]> {
    const result: ISummaryRecord[] = [];

    this.repository.forEach((key, value) => {
      const summary = SummaryRecord.create(userId, value);
      if (summary.success) result.push(summary.content);
    });

    return ServiceResult.Succeeded(result);
  }
}

const reportingService: IReportingService = new ReportingService(keyValueRepository);
export default reportingService;