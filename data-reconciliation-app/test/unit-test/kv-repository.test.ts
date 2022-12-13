import * as polyfill from '@microsoft/ccf-app/polyfill.js';

import * as jscrypto from "crypto";
import { IKeyValueRepository, KeyValueRepository } from "../../src/repositories/kv-repository";
import { DataRecord , StringDataRecord} from "../../src/models/data-record";
import {describe, expect, test, beforeEach, afterEach} from '@jest/globals';


describe('Key value pair Repository', () => {
    let keyValueRepo: IKeyValueRepository<DataRecord>;
    const testKey = jscrypto.randomUUID();
    const testValue: StringDataRecord =  {
        key: testKey,
        value : "test",
        type : "string",
        votes: [{}] 
    };
    beforeEach(() => {
        keyValueRepo = new KeyValueRepository<DataRecord>()
    });

    afterEach(() => {

    });

    test('Should add a new key-value pair', () => {
        
        // Act
        const result = keyValueRepo.set(testKey, testValue);

        // Assert
        console.log(result);

        expect(result).not.toBeNull();
        expect(result.value).toBe(testValue.value);
        expect(result.type).toBe(testValue.type);
        expect(result.votes).toBe(testValue.votes);
        
    });

    test('Should retrieve key-value pair', () => {
        
        // Arrange
        // Act
        const result = keyValueRepo.get(testKey);

        // Assert
        expect(result).not.toBeNull();
        expect(result.value).toBe(testValue.value);
        expect(result.type).toBe(testValue.type);
        expect(result.votes).toBe(testValue.votes);

    });

    test('Should update key-value pair', () => {
        

        // Arrange
        const newTestValue:StringDataRecord = JSON.parse(JSON.stringify(testValue));
        newTestValue.value = "test 2"

        keyValueRepo?.set(testKey, newTestValue);

        // Act
        const result = keyValueRepo?.get(testKey);

        // Assert
        expect(result).not.toBeNull();
        expect(result.value).toBe(newTestValue.value);
        expect(result.type).toBe(newTestValue.type);
        expect(result.votes).toBe(newTestValue.votes);
    });
});
