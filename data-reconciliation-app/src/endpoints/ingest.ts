import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { ApiResult, CCFResponse } from "../utils/api-result";
import { DataSchema } from "../models/data-schema";
import authenticationService from "../services/authentication-service";
import ingestService from "../services/ingest-service";

/**
 * HTTP POST Handler for ingesting dta via JSON
 * @param {ccfapp.Request<any>} request - mTLS request  with userId and JSON data for ingestion
 * @returns {ServiceResult<string>} - data has been ingested successfully
 */
export function postHandler(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  // get caller identity
  const getCallerId = authenticationService.getCallerId(request);
  if (getCallerId.failure) return ApiResult.Failed(getCallerId);
  const callerId = getCallerId.content;

  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isValidIdentity(callerId);
  if (isValidIdentity.failure || !isValidIdentity.content)
    return ApiResult.AuthFailure();

  // read data from request body as json
  let getJsonData = getBodyAsJson(request);
  if (getJsonData.failure) return ApiResult.Failed(getJsonData);
  const data = getJsonData.content;

  // map input data-model to data-record model
  const mapDataRecords = DataSchema.mapDataRecords(data);
  if (mapDataRecords.failure) return ApiResult.Failed(mapDataRecords);

  // submit data to be save to data-store
  const response = ingestService.submitData(callerId, mapDataRecords.content);
  return ApiResult.Succeeded(response);
}

function getBodyAsJson(request: ccfapp.Request<any>): ServiceResult<any> {
  try {
    return ServiceResult.Succeeded(request.body.json());
  } catch (ex) {
    return ServiceResult.Failed({
      errorMessage: ex.message,
      errorType: "InvalidJSON",
      details: ex,
    });
  }
}
