import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { ApiResult, CCFResponse } from "../utils/api-result";
import { DataSchema } from "../models/data-schema";
import authenticationService from "../services/authentication-service";
import ingestService from "../services/ingest-service";

export function postHandler(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  try {
    const getCallerId = authenticationService.getCallerId(request);
    if (getCallerId.failure) {
      return ApiResult.Failed(getCallerId);
    }

    const callerId = getCallerId.content;
    const isValidIdentity = authenticationService.isValidIdentity(callerId);
    if (isValidIdentity.failure || !isValidIdentity.content) {
      return ApiResult.Unauthorized();
    }

    const data = request.body.json();
    const mapDataRecords = DataSchema.mapDataRecords(data);
    if (mapDataRecords.failure) {
      return ApiResult.Failed(mapDataRecords);
    }

    const response = ingestService.submitData(callerId, mapDataRecords.content);
    return ApiResult.Succeeded(response);
  } catch (ex) {
    const response = ServiceResult.Failed({
      errorMessage: ex.message,
      errorType: "DataIngestError",
      details: ex,
    });

    return ApiResult.Failed(response);
  }
}
