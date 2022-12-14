import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { ingestService, authenticationService } from "../utils/dependencies";
import { ApiResult } from "../utils/api-result";
import { DataSchema } from "../models/data-schema";

export function submitData(request: ccfapp.Request<any>): ccfapp.Response<any> {
  try {
    const getCallerId = authenticationService.getCallerId(request);
    if (getCallerId.failure) {
      return ApiResult.Response(getCallerId);
    }

    const callerId = getCallerId.content;
    const isMember = authenticationService.isMember(callerId);
    if (isMember.failure || !isMember.content) {
      return ApiResult.Response(ServiceResult.Unauthorized());
    }

    const data = request.body.json();
    const dataRecords = DataSchema.mapDataRecords(data);
    const response = ingestService.submitData(callerId, dataRecords);
    return ApiResult.Response(response);
  } catch (ex) {
    const response = ServiceResult.Failed({
      errorMessage: ex.message,
      errorType: "DataIngestError",
      details: ex,
    });
    return ApiResult.Response(response);
  }
}
