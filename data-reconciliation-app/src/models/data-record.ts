import * as ccfapp from "@microsoft/ccf-app";
import { User } from "./user";

export type DataAttributeType = string | number;

export class DataRecord {
  key: string;
  value: DataAttributeType;
  votes: object = {};

  get type() {
    return typeof this.value;
  }

  public static create(key: string, value: DataAttributeType, userId: User): DataRecord {
    let newRecord: DataRecord = new DataRecord();
    
    newRecord.key = key;
    newRecord.value = value;
    newRecord.votes[userId] = value;

    return newRecord;
  }
}

export type DataRecordMap = ccfapp.TypedKvMap<string, DataRecord>;