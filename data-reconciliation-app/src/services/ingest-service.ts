import { DataRecord } from "../models/data-record";
import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";

export interface IIngestService {
  submitData(userId: string, dataRecords: DataRecord[]): ServiceResult<string>;
}

export class IngestService implements IIngestService {
  constructor(private readonly keyValueRepo: IRepository<ReconciledRecord>) {}

  // map and store data to kv-store
  public submitData(
    userId: string,
    dataRecords: DataRecord[]
  ): ServiceResult<string> {
    if (!dataRecords || dataRecords.length == 0) {
      return ServiceResult.Failed({
        errorMessage: "Error: ingestion data cannot be null",
        errorType: "InvalidIngestionData",
      });
    }

    for (const record of dataRecords) {
      const hasRecord = this.keyValueRepo.has(record.key);
      if (hasRecord.failure) return ServiceResult.Failed(hasRecord.error);

      if (hasRecord.content) {
        const getRecord = this.keyValueRepo.get(record.key);
        if (getRecord.failure) return ServiceResult.Failed(getRecord.error);

        const updateRecord = ReconciledRecord.update(
          getRecord.content,
          record,
          userId
        );
        if (updateRecord.failure)
          return ServiceResult.Failed(updateRecord.error);

        const saveRecord = this.keyValueRepo.set(
          record.key,
          updateRecord.content
        );
        if (saveRecord.failure) return ServiceResult.Failed(saveRecord.error);
      } else {
        const createRecord = ReconciledRecord.create(record, userId);
        if (createRecord.failure)
          return ServiceResult.Failed(createRecord.error);

        const saveReconRecord = this.keyValueRepo.set(
          record.key,
          createRecord.content
        );
        if (saveReconRecord.failure)
          return ServiceResult.Failed(saveReconRecord.error);
      }
    }

    return ServiceResult.Succeeded("data has ingested successfully");
  }
}

const ingestService: IIngestService = new IngestService(keyValueRepository);
export default ingestService;
