import { ServiceResult } from "../utils/service-result";
import { DataAttributeType } from "./data-record";
import { ReconciledRecord } from "./reconciled-record";

export class StringStatistics {
  
}

export class NumberStatistics {
  mean: number;
  std: number;
}

export type Statistics = StringStatistics | NumberStatistics;


export interface ISummaryRecord {
  key: string;
  value: DataAttributeType;
  group_status: string;
  members_in_agreement: number;
  members_in_disagreement: number;
  members_in_total: number;
  count_of_unique_values: number;
  statistics: Statistics
}

export class SummaryRecord implements ISummaryRecord {

  private constructor(summaryRecord: ISummaryRecord) {

  }
  key: string;
  value: DataAttributeType;
  group_status: string;
  members_in_agreement: number;
  members_in_disagreement: number;
  members_in_total: number;
  count_of_unique_values: number;
  statistics: Statistics;

  public static create(record: ReconciledRecord): ServiceResult<SummaryRecord> {
    if (!record.key)
      return ServiceResult.Failed({
        errorMessage: "Error: key cannot be null or empty",
        errorType: "InvalidRecordKey",
      });

    if (!record.values)
      return ServiceResult.Failed({
        errorMessage: "Error: value values be null or empty",
        errorType: "InvalidRecordValue",
      });

    const dataRecord = new SummaryRecord(props);
    return ServiceResult.Succeeded(dataRecord);
  }
}
