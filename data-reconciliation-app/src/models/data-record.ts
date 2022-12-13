import * as ccfapp from "@microsoft/ccf-app";

// this is unique for each user
export type User = string;

export class DataRecordBase<T> {
  key: string
  value: T;
  type:  "string" | "number";
  votes: object = {};
}

export class StringDataRecord extends DataRecordBase<string> {
  type: "string";
}

export class NumericDataRecord extends DataRecordBase<number> {
  type: "number";
}

export type DataRecord = StringDataRecord | NumericDataRecord;

export type DataRecordMap = ccfapp.TypedKvMap<string, DataRecord>;

