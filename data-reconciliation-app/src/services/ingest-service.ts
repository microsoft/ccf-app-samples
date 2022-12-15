import { DataRecord } from "../models/data-record";
import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";
import { IRepository} from "../repositories/kv-repository";
import { keyValueRepository } from "../utils/dependencies";

export interface IIngestService {
  submitData(userId: string, dataRecords: DataRecord[]): ServiceResult<string>;
}

class IngestService implements IIngestService {
  private keyValueRepo: IRepository<ReconciledRecord>;
  constructor(keyValueRepo: IRepository<ReconciledRecord>) {
    this.keyValueRepo = keyValueRepo;
  }

  // map and store data to kv-store
  public submitData(userId: string, dataRecords: DataRecord[]): ServiceResult<string> {

    dataRecords.forEach((record)=> {
      if(this.keyValueRepo.has(record.key)){
        const reconRecord = this.keyValueRepo.get(record.key);
        const updateReconRecord = ReconciledRecord.update(reconRecord,record, userId);
        if(updateReconRecord.success){
          this.keyValueRepo.set(record.key, updateReconRecord.content);
        }
      }else{
        const createReconRecord = ReconciledRecord.create(record, userId);
        if(createReconRecord.success){
          this.keyValueRepo.set(record.key, createReconRecord.content);
        }
      }
    });

    return ServiceResult.Succeeded("data has ingested successfully");
  }
}

const ingestService: IIngestService = new IngestService(keyValueRepository);
export default ingestService;
