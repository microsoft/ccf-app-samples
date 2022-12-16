import * as ccfapp from "@microsoft/ccf-app";
import { ReconciledRecord } from "../models/reconciled-record";

const kvStore:ccfapp.TypedKvMap<string, ReconciledRecord> = null;// = typedKv("data", ccfapp.string, json<ReconciledRecord>());
export {kvStore}