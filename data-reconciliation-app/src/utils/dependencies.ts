import { IRepository, KeyValueRepository} from "../repositories/kv-repository";
import { ReconciledRecord } from "../models/reconcilied-record";

import * as ccfapp from "@microsoft/ccf-app";
const kvStore = ccfapp.typedKv("data",ccfapp.string,ccfapp.json<ReconciledRecord>());
const keyValueRepository: IRepository<ReconciledRecord> = new KeyValueRepository<ReconciledRecord>(kvStore);
export { keyValueRepository };
