import * as polyfill from '@microsoft/ccf-app/polyfill.js';

import * as jscrypto from "crypto";
import { IKeyValueRepository, KeyValueRepository } from "../../src/repositories/kv-repository";
import { DataRecord } from "../../src/models/data-record";
import {describe, expect, test, beforeEach, afterEach} from '@jest/globals';


describe('Key value pair Repository', () => {
    let keyValueRepo: IKeyValueRepository<DataRecord>;
    const userId = jscrypto.randomUUID();
    const testKey = jscrypto.randomUUID();
    const testDataRecord: DataRecord = DataRecord.create(testKey, "test",userId);

    beforeEach(() => {
        keyValueRepo = new KeyValueRepository<DataRecord>()
    });

    afterEach(() => {

    });

    test('Should add a new key-value pair', () => {
        
        // Act
        const result = keyValueRepo.set(testKey, testDataRecord);

        // Assert
        console.log(result);

        expect(result).not.toBeNull();
        expect(result.value).toBe(testDataRecord.value);
        expect(result.type).toBe(testDataRecord.type);
        expect(result.votes).toBe(testDataRecord.votes);
        
    });

    test('Should retrieve key-value pair', () => {
        
        // Arrange
        // Act
        const result = keyValueRepo.get(testKey);

        // Assert
        expect(result).not.toBeNull();
        expect(result.value).toBe(testDataRecord.value);
        expect(result.type).toBe(testDataRecord.type);
        expect(result.votes).toBe(testDataRecord.votes);

    });

    test('Should update key-value pair', () => {
        

        // Arrange
        const newTestDataRecord: DataRecord = DataRecord.create(testKey, "test 2",userId);


        keyValueRepo?.set(testKey, newTestDataRecord);

        // Act
        const result = keyValueRepo?.get(testKey);

        // Assert
        expect(result).not.toBeNull();
        expect(result.value).toBe(newTestDataRecord.value);
        expect(result.type).toBe(newTestDataRecord.type);
        expect(result.votes).toBe(newTestDataRecord.votes);
    });
});
