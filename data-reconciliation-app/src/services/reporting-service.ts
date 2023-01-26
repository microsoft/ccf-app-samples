import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";
import { SummaryRecord } from "../models/summary-record";

export interface IReportingService {
  /**
   * Reconciliation summary report by a member
   * @param {string} memberId 
   * @returns {ServiceResult<SummaryRecord>}
   */
  getData(memberId: string): ServiceResult<SummaryRecord[]>;

  /**
   * Reconciliation summary report by all members
   * @param {string} memberId 
   * @returns {ServiceResult<SummaryRecord>}
   */
  getDataById(memberId: string, key: string): ServiceResult<SummaryRecord>;
}

export class ReportingService implements IReportingService {
  constructor(private readonly repository: IRepository<ReconciledRecord>) {}

  getDataById(memberId: string, key: string): ServiceResult<SummaryRecord> {
    if (!key || key.length == 0)
      return ServiceResult.Failed({
        errorMessage: "Error: key cannot be null or empty",
        errorType: "InvalidKey",
      });

    const record = this.repository.get(key);

    if (record.failure)
      return ServiceResult.Failed(record.error, record.statusCode);

    return SummaryRecord.create(memberId, record.content);
  }

  public getData(memberId: string): ServiceResult<SummaryRecord[]> {
    const result: SummaryRecord[] = [];

    this.repository.forEach((key, value) => {
      const summary = SummaryRecord.create(memberId, value);
      if (summary.success) result.push(summary.content);
    });

    if (result.length == 0)
      return ServiceResult.Failed({
        errorMessage: "Error: No data to Report",
        errorType: "NoDataToReport",
      });

    return ServiceResult.Succeeded(result);
  }
}

const reportingService: IReportingService = new ReportingService(
  keyValueRepository
);
export default reportingService;
