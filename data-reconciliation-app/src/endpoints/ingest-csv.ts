import * as ccfapp from "@microsoft/ccf-app";
import papa from "papaparse/papaparse.min.js";
import { ServiceResult } from "../utils/service-result";
import { ApiResult, CCFResponse } from "../utils/api-result";
import { DataSchema } from "../models/data-schema";
import authenticationService from "../services/authentication-service";
import ingestService from "../services/ingest-service";

/**
 * HTTP POST Handler for ingesting data via CSV
 * @param {ccfapp.Request<any>} request - mTLS request with userId and CSV file for ingestion
 * @returns {ServiceResult<string>} - data has been ingested successfully
 */
export function postHandlerCsv(request: ccfapp.Request<any>): ccfapp.Response<CCFResponse> {
  // check if caller has a valid identity
  const isValidIdentity = authenticationService.isAuthenticated(request);
  if (isValidIdentity.failure)
    return ApiResult.AuthFailure();

  // caller unique identifier
  const callerId = isValidIdentity.content;

  // read CSV data from request body as json
  let getJsonData = getCsvBodyAsJson(request);
  if (getJsonData.failure) return ApiResult.Failed(getJsonData);
  const data = getJsonData.content;

  // map input data-model to data-record model
  const mapDataRecords = DataSchema.mapDataRecords(data);
  if (mapDataRecords.failure) return ApiResult.Failed(mapDataRecords);

  // submit data to be save to data-store
  const response = ingestService.submitData(callerId, mapDataRecords.content);
  return ApiResult.Succeeded(response);
}

function getCsvBodyAsJson(request: ccfapp.Request<any>): ServiceResult<any> {
  try {
    // parse CSV, converting to json
    var result = papa.parse(request.body.text(), {
      header: true,
      skipEmptyLines: true,
    });
    return ServiceResult.Succeeded(result.data);
  } catch (ex) {
    return ServiceResult.Failed({
      errorMessage: ex.message,
      errorType: "InvalidCsvToJSON",
      details: ex,
    });
  }
}
