import { ServiceResult } from "../utils/service-result";

export type DataAttributeType = string | number;
export interface DataRecordProps {
  key: string;
  value: DataAttributeType;
}

export class DataRecord implements DataRecordProps {
  public readonly key: string;
  public readonly value: DataAttributeType;
  public readonly type: string;

  private constructor(props: DataRecordProps) {
    this.key = props.key;
    this.value = props.value;
    this.type = typeof this.value;
  }

  public static create(props: DataRecordProps): ServiceResult<DataRecord> {
    if (!props.key)
      return ServiceResult.Failed({
        errorMessage: "Error: key cannot be null or empty",
        errorType: "InvalidRecordKey",
      });

    if (!props.value)
      return ServiceResult.Failed({
        errorMessage: "Error: value cannot be null or empty",
        errorType: "InvalidRecordValue",
      });

    const dataRecord = new DataRecord(props);
    return ServiceResult.Succeeded(dataRecord);
  }
}
