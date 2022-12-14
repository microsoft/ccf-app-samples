
export type DataAttributeType = string | number;
export class DataRecord {
  key: string;
  value: DataAttributeType;

  get type() {
    return typeof this.value;
  }

  public static create(key: string, value: DataAttributeType): DataRecord {
    let newRecord: DataRecord = new DataRecord();
    newRecord.key = key;
    newRecord.value = value;
    return newRecord;
  }
}

export type DataRecordMap = Object;
