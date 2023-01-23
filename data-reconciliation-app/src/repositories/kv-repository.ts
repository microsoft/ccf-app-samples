import * as ccfapp from "@microsoft/ccf-app";
import { ReconciledRecord } from "../models/reconciled-record";
import { ServiceResult } from "../utils/service-result";

/**
 * Generic Key-Value implementation wrapping CFF TypedKvMap storage engine
 */
export interface IRepository<T> {
  /**
   * Store {T} in CFF TypedKvMap storage by key
   * @param {string} key 
   * @param {T} value 
   */
  set(key: string, value: T): ServiceResult<T>;

  /**
   * Retrive {T} in CFF TypedKvMap storage by key
   * @param {string} key 
   * @param {T} value 
   */
  get(key: string): ServiceResult<T>;

  /**
   * Check if {T} exists in CFF TypedKvMap storage by key
   * @param {string} key 
   * @param {T} value 
   */
  has(key: string): ServiceResult<boolean>;

  /**
   * Retrieve all keys in CFF TypedKvMap storage
   */
  keys(): ServiceResult<string[]>;

  /**
   * Retrieve all values in CFF TypedKvMap storage
   */
  values(): ServiceResult<T[]>;

  /**
   * Get size of CFF TypedKvMap storage
   * @returns {ServiceResult<number>}
   */
  get size(): ServiceResult<number>;

  /**
   * Iterate through CFF TypedKvMap storage by key
   * @param callback 
   */
  forEach(callback: (key: string, value: T) => void): ServiceResult<string>;

  /**
   * Clears CFF TypedKvMap storage
   */
  clear(): ServiceResult<void>
}

export class KeyValueRepository<T> implements IRepository<T> {
  private kvStore: ccfapp.TypedKvMap<string, T>;

  public constructor(kvStore: ccfapp.TypedKvMap<string, T>) {
    this.kvStore = kvStore;
  }
  
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
  
  public get(key: string): ServiceResult<T> {
    try {
      const value = this.kvStore.get(key);
      if (value === undefined) {
        return ServiceResult.Failed({
          errorMessage: "Error: key does not exist",
          errorType: "KeyValueStoreError",
        });
      }

      return ServiceResult.Succeeded(value);
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to read value from the kvstore",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

  public has(key: string): ServiceResult<boolean> {
    try {
      return ServiceResult.Succeeded(this.kvStore.has(key));
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to check if key exists in the kvstore",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

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

  // 
  public forEach(callback: (key: string, value: T) => void): ServiceResult<string> {
    try {
      this.kvStore.forEach((val, key) => {
        callback(key, val);
      });

      return ServiceResult.Succeeded("");
    } catch (ex) {
      return ServiceResult.Failed({
        errorMessage: "Error: unable to iterate the kvstore pairs",
        errorType: "KeyValueStoreError",
        details: ex,
      });
    }
  }

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

const kvStore = ccfapp.typedKv("data",ccfapp.string,ccfapp.json<ReconciledRecord>());
const keyValueRepository: IRepository<ReconciledRecord> = new KeyValueRepository<ReconciledRecord>(kvStore);
export default keyValueRepository;
