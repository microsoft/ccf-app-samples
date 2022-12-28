import { ServiceResult } from "../utils/service-result";
import { DataRecord } from "./data-record";

export type ReconciliationMap = Object;

export interface ReconciledRecordProps {
  key: string;
  type: string;
  values: ReconciliationMap;
}

export class ReconciledRecord implements ReconciledRecordProps {
  key: string;
  type: string;
  values: ReconciliationMap = {};

  private constructor() {}

  public static create(
    record: DataRecord,
    userId: string
  ): ServiceResult<ReconciledRecord> {
    const newRecord: ReconciledRecord = new ReconciledRecord();

    newRecord.key = record.key;
    newRecord.type = record.type;
    newRecord.values = {};
    newRecord.values[userId] = record.value;
    return ServiceResult.Succeeded(newRecord);
  }

  public static update(
    record: ReconciledRecord,
    newRecordValue: DataRecord,
    userId: string
  ): ServiceResult<ReconciledRecord> {
    record.key = newRecordValue.key;
    record.values[userId] = newRecordValue.value;
    return ServiceResult.Succeeded(record);
  }
}
