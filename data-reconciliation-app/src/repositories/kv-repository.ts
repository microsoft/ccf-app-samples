import { ServiceResult } from '../utils/service-result';
import * as ccfapp from "@microsoft/ccf-app";

export interface IKeyValueRepository<T> {
    set(key: string, value : T): ServiceResult<T>;
    get(key: string): ServiceResult<T>;
}

// generic key-value repository wrapping ccf TypedKvMap interaction
export class KeyValueRepository<T> implements IKeyValueRepository<T> {

    private kvStore: ccfapp.TypedKvMap<string, T>;

    public constructor(){
        this.kvStore = this.getDataMap();
        console.log(this.kvStore)
    }

    // update key-value pair or create new record if key not exists
    public set(key: string, value: T): ServiceResult<T> {
        try {
            
            this.kvStore.set(key, value);
            return ServiceResult.Succeeded(value);

        } catch (e) {
            return ServiceResult.Failed({
                errorMessage: 'Error saving new key-value pair',
                errorType: 'ErrorInSavingKeyValuePair',
                details: e,
            });
        }
    }

    // retrieve key value from kv-store
    public get(key: string): ServiceResult<T> {

        try {
            const val = this.kvStore.get(key);
            if (!val) {
                return ServiceResult.Failed({ errorMessage: 'key not found', errorType: 'KeyNotFound' });
            }
            return ServiceResult.Succeeded<T>(val);
            
        } catch (e) {
            return ServiceResult.Failed({
                errorMessage: 'Error reading key value',
                errorType: 'ErrorReadingKeyValue',
                details: e,
            });
        }
    }

    // create a typed key-value map of type "AttributeMap"
    private getDataMap(): ccfapp.TypedKvMap<string, T> {
        return ccfapp.typedKv("votes", ccfapp.string, ccfapp.json<T>());
    }
}