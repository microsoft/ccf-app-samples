import * as jscrypto from "crypto";
import { IKeyValueRepository, KeyValueRepository } from "../../src/repositories/kv-repository";
import { Attribute , StringAttribute} from "../../src/models/attribute";
import {describe, expect, test, beforeEach, afterEach} from '@jest/globals';
//import '@microsoft/ccf-app/polyfill.js';
//import * as ccfapp from '@microsoft/ccf-app';

describe('Key value pair Repository', () => {
    let keyValueRepo: IKeyValueRepository<Attribute>;
    const testKey = jscrypto.randomUUID();
    const testValue: StringAttribute =  {
        value : "test",
        type : "string",
        votes: [{}] 
    };
    beforeEach(() => {
        //keyValueRepo = new KeyValueRepository<Attribute>()
    });

    afterEach(() => {

    });

    test('Should add a new key-value pair', () => {
        
        // Act
        const result = keyValueRepo.set(testKey, testValue);

        // Assert
        console.log(result);

        expect(result).not.toBeNull();
        expect(result?.success).toBe(true);
        expect(result?.content).not.toBeNull();
        
        expect(result?.content?.value).toBe(testValue.value);
        expect(result?.content?.type).toBe(testValue.type);
        expect(result?.content?.votes).toBe(testValue.votes);
        
    });

    test('Should retrieve key-value pair', () => {
        
        // Arrange
        // Act
        const result = keyValueRepo.get(testKey);

        // Assert
        expect(result).not.toBeNull();
        expect(result?.success).toBe(true);
        expect(result?.content).not.toBeNull();

        expect(result?.content?.value).toBe(testValue.value);
        expect(result?.content?.type).toBe(testValue.type);
        expect(result?.content?.votes).toBe(testValue.votes);

    });

    test('Should update key-value pair', () => {
        

        // Arrange
        const newTestValue:StringAttribute = JSON.parse(JSON.stringify(testValue));
        newTestValue.value = "test 2"

        keyValueRepo?.set(testKey, newTestValue);

        // Act
        const result = keyValueRepo?.get(testKey);

        // Assert
        expect(result).not.toBeNull();
        expect(result?.success).toBe(true);
        expect(result?.content).not.toBeNull();

        expect(result?.content?.value).toBe(newTestValue.value);
        expect(result?.content?.type).toBe(newTestValue.type);
        expect(result?.content?.votes).toBe(newTestValue.votes);
    });
});
