import { Attribute, User } from "../models/attribute";
import { ServiceResult } from "../utils/service-result";
import {  IKeyValueRepository } from "../repositories/kv-repository"

export interface IIngestService {
    submitVotes(userId: string, dataRecords: any[]): ServiceResult<string>;
}

export class IngestService implements IIngestService {

    private keyValueRepository: IKeyValueRepository<Attribute>;
     
    constructor(keyValueRepository: IKeyValueRepository<Attribute>){
        this.keyValueRepository = keyValueRepository;
    }
    
    public submitVotes(userId: User, dataRecords: any[]): ServiceResult<string> {
        return ServiceResult.Succeeded("data ingested successfully");
    }

}