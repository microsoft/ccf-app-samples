import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { reportingService,authenticationService } from "../utils/DI";

export function getDataSummary(request: ccfapp.Request<any>): ccfapp.Response<any> {
  try {

    const userId = authenticationService.getCallerId(request);
    if (!authenticationService.isMember(userId)) {
      return ServiceResult.Unauthorized();
    }

    const response = reportingService.getData(userId);
    return { statusCode: response.statusCode, body:response };

  } catch (ex) {
    const response = ServiceResult.Failed({errorMessage: ex.message, errorType: "DataIngestError", details: ex })
    return { statusCode: response.statusCode , body: response };
  }
}
