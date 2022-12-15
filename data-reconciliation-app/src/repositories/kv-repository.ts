import * as ccfapp from "@microsoft/ccf-app";
import { ReconciledRecord } from "../models/reconcilied-record";

export interface IRepository<T> {
  set(key: string, value: T): T;
  get(key: string): T;
  has(key: string): boolean;
  keys(): string[];
  values(): T[];
  get size(): number;
}

// generic key-value repository wrapping ccf TypedKvMap interaction
export class KeyValueRepository<T> implements IRepository<T> {
  private kvStore: ccfapp.TypedKvMap<string, T>;

  public constructor(kvStore: ccfapp.TypedKvMap<string, T>) {
    this.kvStore = kvStore;
  }

  // update key-value pair or create new record if key not exists
  public set(key: string, value: T): T {
    this.kvStore.set(key, value);
    return value;
  }

  // retrieve key value from kv-store
  public get(key: string): T {
    return this.kvStore.get(key);
  }

  // check if key exists
  public has(key: string): boolean {
    return this.kvStore.has(key);
  }

  // retrieve all keys of kv-store
  public keys(): string[] {
    const keys: string[] = [];
    this.kvStore.forEach((val, key) => {
      keys.push(key);
    });
    return keys;
  }

  // retrieve all values of kv-store
  public values(): T[] {
    const values: T[] = [];
    this.kvStore.forEach((val, key) => {
      values.push(val);
    });
    return values;
  }

  // clear all key-value pairs of kv-store
  public clear(): void {
    this.kvStore.clear();
  }

  // get key-value store item count
  public get size(): number {
    return this.kvStore.size;
  }
}

const kvStore = ccfapp.typedKv("data",ccfapp.string,ccfapp.json<ReconciledRecord>());
const keyValueRepository: IRepository<ReconciledRecord> = new KeyValueRepository<ReconciledRecord>(kvStore);
export default keyValueRepository;

