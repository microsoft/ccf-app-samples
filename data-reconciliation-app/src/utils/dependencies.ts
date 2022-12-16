import { ReconciledRecord } from "../models/reconciled-record";
import * as ccfapp from "@microsoft/ccf-app";
const kvStore = ccfapp.typedKv(
  "data",
  ccfapp.string,
  ccfapp.json<ReconciledRecord>()
);

export { kvStore };
