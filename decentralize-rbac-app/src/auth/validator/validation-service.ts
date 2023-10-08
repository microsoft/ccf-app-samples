import * as ccfapp from "@microsoft/ccf-app";
import { ServiceResult } from "../../utils/service-result";

/**
 * Validator Service Interface
 */

type identityId = string;
export interface IValidatorService {
  validate(request: ccfapp.Request<any>): ServiceResult<identityId>;
}
