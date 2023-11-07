import { ccf } from "@microsoft/ccf-app/global";
import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";

/**
 * Generic Key-Value implementation wrapping CCF TypedKvMap storage engine
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
  clear(): ServiceResult<void>;

  /**
   * Remove a key from the TypedKvMap storage
   */
  delete(key: string): ServiceResult<void>;
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
      console.log(`Exception in kvstore.set: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to set value to the kvstore",
        errorType: "KeyValueStoreError",
      });
    }
  }

  public get(key: string): ServiceResult<T> {
    try {
      const value: any = this.kvStore.get(key);

      if (value === undefined) {
        return ServiceResult.Failed({
          errorMessage: "Error: key does not exist",
          errorType: "KeyValueStoreError",
        });
      }

      const data = value as T;

      return ServiceResult.Succeeded(data);
    } catch (ex) {
      console.log(`Exception in kvstore.get: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to read value from the kvstore",
        errorType: "KeyValueStoreError",
      });
    }
  }

  public has(key: string): ServiceResult<boolean> {
    try {
      return ServiceResult.Succeeded(this.kvStore.has(key));
    } catch (ex) {
      console.log(`Exception in kvstore.has: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to check if key exists in the kvstore",
        errorType: "KeyValueStoreError",
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
      console.log(`Exception in kvstore.keys: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to get kvstore all keys",
        errorType: "KeyValueStoreError",
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
      console.log(`Exception in kvstore.values: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to get kvstore all values",
        errorType: "KeyValueStoreError",
      });
    }
  }

  public clear(): ServiceResult<void> {
    try {
      return ServiceResult.Succeeded(this.kvStore.clear());
    } catch (ex) {
      console.log(`Exception in kvstore.clear: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to clear kvstore values",
        errorType: "KeyValueStoreError",
      });
    }
  }

  public delete(key: string): ServiceResult<void> {
    try {
      return ServiceResult.Succeeded(this.kvStore.delete(key));
    } catch (ex) {
      console.log(`Exception in kvstore.delete: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to remove a key",
        errorType: "KeyValueStoreError",
      });
    }
  }

  //
  public forEach(
    callback: (key: string, value: T) => void,
  ): ServiceResult<string> {
    try {
      this.kvStore.forEach((val, key) => {
        callback(key, val);
      });

      return ServiceResult.Succeeded("");
    } catch (ex) {
      console.log(`Exception in kvstore.foreach: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: user callback function failed ",
        errorType: "UnexpectedError",
      });
    }
  }

  public get size(): ServiceResult<number> {
    try {
      return ServiceResult.Succeeded(this.kvStore.size);
    } catch (ex) {
      console.log(`Exception in kvstore.size: ${ex}`);
      return ServiceResult.Failed({
        errorMessage: "Error: unable to get the kvstore size",
        errorType: "KeyValueStoreError",
      });
    }
  }
}

const kvRoleActionStore = ccfapp.typedKv(
  "public:rbac.roles",
  ccfapp.string,
  ccfapp.string,
);
export const keyValueRoleActionRepository: IRepository<any> =
  new KeyValueRepository<any>(kvRoleActionStore);

const kvUserRoleStore = ccfapp.typedKv(
  "public:rbac.users",
  ccfapp.string,
  ccfapp.string,
);
export const keyValueUserRoleRepository: IRepository<any> =
  new KeyValueRepository<any>(kvUserRoleStore);
