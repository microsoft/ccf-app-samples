import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";
import { ApiResult } from "../utils/api-result";
import { DataConcilationReport } from "../models/data-conciliation-report";

export interface IReportingService {
  getData(userId: string): ServiceResult<DataConcilationReport>;
  getDataById(userId: string, key: string): ServiceResult<DataConcilationReport>;
}

export class ReportingService implements IReportingService {
  constructor(private readonly repository: IRepository<ReconciledRecord>) {}

  getDataById(userId: string, key: string): ServiceResult<DataConcilationReport> {
    const result = this.repository.values();

    if(result.failure) {
      console.error(result.error);
      return result;
    }

    const createReportById = DataConcilationReport.createById(userId, key, result.content!);
    if (createReportById) {
      console.error(result.error);
      return createReportById;
    }

    return ServiceResult.Succeeded(createReportById);
  }

  public getData(userId: string): ServiceResult<object> {
    const result = this.repository.values();

    if(result.failure) {
      console.error(result.error);
      return result;
    }

    const createReport = DataConcilationReport.create(userId, result.content!);
    if (createReport) {
      console.error(result.error);
      return createReport;
    }

    return ServiceResult.Succeeded(createReport);
  }
}

const reportingService: IReportingService = new ReportingService(keyValueRepository);
export default reportingService;
