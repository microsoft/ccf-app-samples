import { ServiceResult } from "../utils/service-result";
import { DataRecord } from "./data-record";

export type ReconciliationMap = Object;

export interface ReconciledRecordProps {
  key: string;
  values: ReconciliationMap;
}

export class ReconciledRecord implements ReconciledRecordProps {
  key: string;
  values: ReconciliationMap = {};

  public static create(
    record: DataRecord,
    userId: string
  ): ServiceResult<ReconciledRecord> {
    let newRecord: ReconciledRecord = new ReconciledRecord();
    newRecord.key = record.key;
    newRecord.values[userId] = record.value;
    return ServiceResult.Succeeded(newRecord);
  }

  public static update(
    record: ReconciledRecord,
    newRecordValue: DataRecord,
    userId: string
  ): ServiceResult<ReconciledRecord> {
    record.values[userId] = newRecordValue.key;
    return ServiceResult.Succeeded(record);
  }
}
