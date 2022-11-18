import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";

function parseRequestQuery(request: ccfapp.Request<any>): any {
  const elements = request.query.split("&");
  const obj = {};
  for (const kv of elements) {
    const [k, v] = kv.split("=");
    obj[k] = v;
  }
  return obj;
}

interface Caller {
  id: string;
}

function getCallerId(request: ccfapp.Request<any>): string {
  // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  const caller = request.caller as unknown as Caller;
  return caller.id;
}

function isUser(userId: string): boolean {
  // Check if user exists
  // https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
  const usersCerts = ccfapp.typedKv(
    "public:ccf.gov.users.certs",
    ccfapp.arrayBuffer,
    ccfapp.arrayBuffer
  );
  return usersCerts.has(ccf.strToBuf(userId));
}

function isMember(memberId: string): boolean {
  // Check if member exists
  // https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
  const membersCerts = ccfapp.typedKv(
    "public:ccf.gov.members.certs",
    ccfapp.arrayBuffer,
    ccfapp.arrayBuffer
  );
  return membersCerts.has(ccf.strToBuf(memberId));
}

interface Range {
  start?: number
  end?: number // TODO: rename to last
}

type LogIdAccessType = "ANY" | "SPECIFIED_RANGE";
interface LogIdAccess {
  type: LogIdAccessType
  // Only for "PECIFIED_RANGE"
  range?: Range
}

type SeqNoAccessType = "ANY" | "ONLY_LATEST" | "SPECIFIED_RANGE";
interface SeqNoAccess {
  type: SeqNoAccessType
  // Only for "SPECIFIED_RANGE"
  range?: Range
}

interface PermissionItem {
  logId: LogIdAccess;
  seqNo: SeqNoAccess;
}

const permissionTableName = "log_access_permissions";
const userIdToPermission = ccfapp.typedKv(
  permissionTableName,
  ccfapp.string /** User ID */,
  ccfapp.json<PermissionItem>()
);

function checkUserAccess(userId: string, logId: number, seqNo?: number): boolean {
  // If seqNo is not given, it returns whether if the user has access to the latest sequence number. 
  // TODO: improve if statments 

  // Access is not allowed if perssion is not set explicitly.
  if (!userIdToPermission.has(userId)) {
    return false;
  }

  const permission = userIdToPermission.get(userId);
  if (permission.seqNo.type === "ONLY_LATEST" && seqNo) {
    return false;
  }
  else if (permission.seqNo.type === "SPECIFIED_RANGE") {
    if (
      seqNo === undefined ||
      (permission.seqNo.range.start === undefined &&
        permission.seqNo.range.end === undefined) ||
      (permission.seqNo.range.start !== undefined && permission.seqNo.range.start > seqNo) ||
      (permission.seqNo.range.end !== undefined && permission.seqNo.range.end < seqNo)
    ) {
      return false;
    }
  }

  if (permission.logId.type === "ANY") {
    return true;
  } else if (
    (permission.logId.range.start === undefined &&
      permission.logId.range.end === undefined) ||
    (permission.logId.range.start !== undefined && permission.logId.range.start > logId) ||
    (permission.logId.range.end !== undefined && permission.logId.range.end < logId)
  ) {
    return false;
  } else {
    return true;
  }
}

interface LogItem {
  msg: string;
}

interface LogEntry extends LogItem {
  id: number;
}

const logMap = ccfapp.typedKv("log", ccfapp.uint32, ccfapp.json<LogItem>());

export function getLogItem(request: ccfapp.Request): ccfapp.Response<LogItem | string> {
  const parsedQuery = parseRequestQuery(request);

  const logId = parseInt(parsedQuery.log_id);
  if (logId === NaN) {
    return {
      statusCode: 400
    }
  }
  const parsedSeqNo = parseInt(parsedQuery.seq_no);
  const seqNo = parsedSeqNo ? parsedSeqNo : undefined;
  const callerId = getCallerId(request);
  if (
    !(isMember(callerId) || (isUser(callerId) && checkUserAccess(callerId, logId, seqNo)))
  ) {
    return {
      statusCode: 403,
    };
  }
  if (!logMap.has(logId)) {
    return {
      statusCode: 404,
    };
  }
  if (!seqNo) {
    return {
      body: logMap.get(logId),
    };
  }
  else {
    const rangeBegin = seqNo;
    const rangeEnd = seqNo;

    // Make hundle based on https://github.com/microsoft/CCF/blob/main/samples/apps/logging/js/src/logging.js
    // Compute a deterministic handle for the range request.
    // Note: Instead of ccf.digest, an equivalent of std::hash should be used.
    const makeHandle = (begin: number, end: number): number => {
      const cacheKey = `${begin}-${end}`;
      const digest = ccf.digest("SHA-256", ccf.strToBuf(cacheKey));
      const handle = new DataView(digest).getUint32(0);
      return handle;
    };
    const handle = makeHandle(rangeBegin, rangeEnd);

    // Fetch the requested range
    const expirySeconds = 1800;
    const states = ccf.historical.getStateRange(
      handle,
      rangeBegin,
      rangeEnd,
      expirySeconds
    );
    if (states === null) {
      return {
        statusCode: 202,
        headers: {
          "retry-after": "1",
        },
        body: `Historical transactions from ${rangeBegin} to ${rangeEnd} are not yet available, fetching now`,
      };
    }
    const firstKv = states[0].kv;
    const logMapHistorical = ccfapp.typedKv(
      firstKv["log"],
      ccfapp.uint32,
      ccfapp.json<LogItem>()
    );
    return {
      body: logMapHistorical.get(logId),
    };
  }
}

export function setLogItem(request: ccfapp.Request<LogItem>): ccfapp.Response {
  const parsedQuery = parseRequestQuery(request);
  const logId = parseInt(parsedQuery.log_id);
  logMap.set(logId, request.body.json());
  return {};
}

function validatePermission(permission: any): boolean {
  // TODO: improve check
  const permissionPropertyKeys = new Set([
    "allowAnySeqNo",
    "allowAnyLogId",
    "startSeqNo",
    "endSeqNo",
    "startLogId",
    "endLogId",
    "allowOnlyLatestSeqNo",
  ]);
  const booleanKeys = new Set(["allowAnySeqNo", "allowAnyLogId", "allowOnlyLatestSeqNo"]);
  const numberKeys = new Set([
    "startSeqNo",
    "endSeqNo",
    "startLogId",
    "endLogId",
  ]);
  for (const [key, value] of Object.entries(permission)) {
    if (!permissionPropertyKeys.has(key)) {
      return false;
    }
    if (typeof value !== "boolean" && typeof value != "number") {
      return false;
    }
    if (typeof value === "boolean" && !booleanKeys.has(key)) {
      return false;
    }
    if (typeof value === "number" && !numberKeys.has(key)) {
      return false;
    }
  }

  const p = permission;
  if (p.allowAnyLogId === true) {
    if (p.startLogId || p.endLogId) {
      return false;
    }
  }
  if (p.allowAnySeqNo === true || p.allowOnlyLatestSeqNo) {
    if (p.startSeqNo || p.endSeqNo) {
      return false;
    }
  }

  return true;
}

function convertRequestBodyToPermissionItem(body: any) {
  // `body` should be validated with validatePermission() before calling this function
  let permission: PermissionItem = {
    logId: {
      type: "SPECIFIED_RANGE"
    },
    seqNo: {
      type: "SPECIFIED_RANGE"
    }
  };
  permission.logId = {
    type: body.allowAnyLogId ? "ANY" : "SPECIFIED_RANGE",
    range: !body.allowAnyLogId ? {
      start: body.startLogId,
      end: body.endLogId
    } : undefined
  };

  if (body.allowAnySeqNo) {
    permission.seqNo.type = "ANY";
  }
  else if (body.allowOnlyLatestSeqNo) {
    permission.seqNo.type = "ONLY_LATEST";
  }
  else {
    // type: "SPECIFIED_RANGE"
    permission.seqNo.range = {
      start: body.startSeqNo,
      end: body.endSeqNo
    }
  }
  return permission;
}

export function setUserPermission(request: ccfapp.Request): ccfapp.Response {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
    };
  }
  const userId = request.params.user_id;
  if (!isUser(userId)) {
    return {
      statusCode: 404,
    };
  }
  if (!validatePermission(body)) {
    return {
      statusCode: 400,
    };
  }

  userIdToPermission.set(userId, convertRequestBodyToPermissionItem(body));
  return {
    statusCode: 204,
  };
}
