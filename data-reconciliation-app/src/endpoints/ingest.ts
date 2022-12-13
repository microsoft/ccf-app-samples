import * as ccfapp from "@microsoft/ccf-app";
import { Attribute } from "../models/attribute";
import { IKeyValueRepository, KeyValueRepository } from "../repositories/kv-repository";
import { AuthenticationService } from "../services/authentication-service";
import { IngestService } from "../services/ingest-service";
import { HttpStatusCode, ServiceResult } from "../utils/service-result";



export function post(request: ccfapp.Request): ccfapp.Response<ServiceResult<string>> {
  
  const keyValueRepository: IKeyValueRepository<Attribute> = new KeyValueRepository<Attribute>();
  const ingestService = new IngestService(keyValueRepository);
  const authenticationService = new AuthenticationService();

  const userId = authenticationService.getCallerId(request);

  if(!authenticationService.isMember(userId))
  {
     return ServiceResult.Unauthorized();
  }

  const dataRecords: any[] = request.body.json();
  return ingestService.submitVotes(userId, dataRecords);
}

