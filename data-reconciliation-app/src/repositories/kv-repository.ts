import * as ccfapp from "@microsoft/ccf-app";
import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";

export interface IRepository<T> {
  set(key: string, value: T): ServiceResult<T>;
  get(key: string): ServiceResult<T>;
  has(key: string): ServiceResult<boolean>;
  keys(): ServiceResult<string[]>;
  values(): ServiceResult<T[]>;
  get size(): ServiceResult<number>;
}

// generic key-value repository wrapping ccf TypedKvMap interaction
export class KeyValueRepository<T> implements IRepository<T> {
  private kvStore: ccfapp.TypedKvMap<string, T>;

  public constructor(kvStore: ccfapp.TypedKvMap<string, T>) {
    this.kvStore = kvStore;
  }

  // update key-value pair or create new record if key not exists
  public set(key: string, value: T): ServiceResult<T> {
    try {
      this.kvStore.set(key, value);
      return ServiceResult.Succeeded(value);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to set value to the kvstore",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  // retrieve key value from kv-store
  public get(key: string): ServiceResult<T> {
    try {
      return ServiceResult.Succeeded(this.kvStore.get(key));
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to read value from the kvstore",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  // check if key exists
  public has(key: string): ServiceResult<boolean> {
    try {
      return ServiceResult.Succeeded(this.kvStore.has(key));
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to check if key exists  in the kvstore",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  // retrieve all keys of kv-store
  public keys(): ServiceResult<string[]> {
    try {
      const keys: string[] = [];
      this.kvStore.forEach((val, key) => {
        keys.push(key);
      });
      return ServiceResult.Succeeded(keys);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to get kvstore all keys",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  // retrieve all values of kv-store
  public values(): ServiceResult<T[]> {
    try {
      const values: T[] = [];
      this.kvStore.forEach((val, key) => {
        values.push(val);
      });
      return ServiceResult.Succeeded(values);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to get kvstore all values",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  // clear all key-value pairs of kv-store
  public clear(): ServiceResult<void> {
    try {
      return ServiceResult.Succeeded(this.kvStore.clear());
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to clear kvstore values",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  // get key-value store item count
  public get size(): ServiceResult<number> {
    try {
      return ServiceResult.Succeeded(this.kvStore.size);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to get the kvstore size",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }
}

const kvStore = ccfapp.typedKv(
  "data",
  ccfapp.string,
  ccfapp.json<ReconciledRecord>()
);
const keyValueRepository: IRepository<ReconciledRecord> =
  new KeyValueRepository<ReconciledRecord>(kvStore);
export default keyValueRepository;
