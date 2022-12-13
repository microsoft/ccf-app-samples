import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../utils/service-result";
import { ingestService,authenticationService } from "../utils/DI";

export function submitData(request: ccfapp.Request<any>): ccfapp.Response<any> {
  try {
    const userId = authenticationService.getCallerId(request);
    if (!authenticationService.isMember(userId)) {
      return ServiceResult.Unauthorized();
    }

    const dataRecords = request.body.json();
    const response = ingestService.submitData(userId, dataRecords);
    return { statusCode: response.statusCode, body:response };

  } catch (ex) {
    const response = ServiceResult.Failed({errorMessage: ex.message, errorType: "DataIngestError", details: ex })
    return { statusCode: response.statusCode , body: response };
  }
}
