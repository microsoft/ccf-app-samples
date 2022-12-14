import {
  IKeyValueRepository,
  KeyValueRepository,
} from "../repositories/kv-repository";
import {
  AuthenticationService,
  IAuthenticationService,
} from "../services/authentication-service";
import {
  ReportingService,
  IReportingService,
} from "../services/reporting-service";
import { DataRecordMap } from "../models/data-record";
import { IIngestService, IngestService } from "../services/ingest-service";

const keyValueRepository: IKeyValueRepository<DataRecordMap> =
  new KeyValueRepository<DataRecordMap>();
const ingestService: IIngestService = new IngestService(keyValueRepository);
const reportingService: IReportingService = new ReportingService(
  keyValueRepository
);
const authenticationService: IAuthenticationService =
  new AuthenticationService();

export {
  keyValueRepository,
  ingestService,
  reportingService,
  authenticationService,
};
