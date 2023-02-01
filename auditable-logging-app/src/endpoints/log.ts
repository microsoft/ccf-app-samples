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
  start?: number;
  last?: number;
}

type LogIdAccessType = "ANY" | "SPECIFIED_RANGE";
interface LogIdAccess {
  type: LogIdAccessType;
  // Only for "SPECIFIED_RANGE"
  range?: Range;
}

type SeqNoAccessType = "ANY" | "ONLY_LATEST" | "SPECIFIED_RANGE";
interface SeqNoAccess {
  type: SeqNoAccessType;
  // Only for "SPECIFIED_RANGE"
  range?: Range;
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

/**
 * Check user's access to a log item
 *
 * If seqNo is not given, it returns whether if the user has access to the latest sequence number.
 */
function checkUserAccess(
  userId: string,
  logId: number,
  seqNo?: number
): boolean {
  // Access is not allowed if perssion is not set explicitly.
  if (!userIdToPermission.has(userId)) {
    return false;
  }

  // Check sequence number.
  const permission = userIdToPermission.get(userId);
  const usingHistoricalQueryBuItIsNotAllowed: boolean =
    permission.seqNo.type === "ONLY_LATEST" && typeof seqNo === "number";
  const outOfPermittedSeqNoRange: boolean =
    permission.seqNo.type === "SPECIFIED_RANGE" &&
    (seqNo === undefined ||
      (permission.seqNo.range.start === undefined &&
        permission.seqNo.range.last === undefined) ||
      (permission.seqNo.range.start !== undefined &&
        permission.seqNo.range.start > seqNo) ||
      (permission.seqNo.range.last !== undefined &&
        permission.seqNo.range.last < seqNo));
  if (usingHistoricalQueryBuItIsNotAllowed || outOfPermittedSeqNoRange) {
    return false;
  }

  // Check log ID.
  const outOfPermittedLogIdRange: boolean =
    permission.logId.type === "SPECIFIED_RANGE" &&
    ((permission.logId.range.start === undefined &&
      permission.logId.range.last === undefined) ||
      (permission.logId.range.start !== undefined &&
        permission.logId.range.start > logId) ||
      (permission.logId.range.last !== undefined &&
        permission.logId.range.last < logId));
  return !outOfPermittedLogIdRange;
}

interface LogItem {
  msg: string;
}

interface LogEntry extends LogItem {
  id: number;
}

const logMap = ccfapp.typedKv("log", ccfapp.uint32, ccfapp.json<LogItem>());

export function getLogItem(
  request: ccfapp.Request
): ccfapp.Response<LogItem | string> {
  const parsedQuery = parseRequestQuery(request);

  const logId = parseInt(parsedQuery.log_id);
  if (Number.isNaN(logId)) {
    return {
      statusCode: 400,
    };
  }
  const parsedSeqNo = parseInt(parsedQuery.seq_no);
  const seqNo = parsedSeqNo ? parsedSeqNo : undefined;
  const callerId = getCallerId(request);
  if (
    !(
      isMember(callerId) ||
      (isUser(callerId) && checkUserAccess(callerId, logId, seqNo))
    )
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
  } else {
    const rangeBegin = seqNo;
    const rangeLast = seqNo;

    // Make hundle based on https://github.com/microsoft/CCF/blob/main/samples/apps/logging/js/src/logging.js
    // Compute a deterministic handle for the range request.
    // Note: Instead of ccf.digest, an equivalent of std::hash should be used.
    const makeHandle = (begin: number, last: number): number => {
      const cacheKey = `${begin}-${last}`;
      const digest = ccf.digest("SHA-256", ccf.strToBuf(cacheKey));
      const handle = new DataView(digest).getUint32(0);
      return handle;
    };
    const handle = makeHandle(rangeBegin, rangeLast);

    // Fetch the requested range
    const expirySeconds = 1800;
    const states = ccf.historical.getStateRange(
      handle,
      rangeBegin,
      rangeLast,
      expirySeconds
    );
    if (states === null) {
      return {
        statusCode: 202,
        headers: {
          "retry-after": "1",
        },
        body: `Historical transactions from ${rangeBegin} to ${rangeLast} are not yet available, fetching now`,
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
  return {
    statusCode: 204,
  };
}

function validatePermission(permission: any): boolean {
  // Check if permission has PermissionItem interface.
  const permissionPropertyKeys = new Set([
    "allowAnySeqNo",
    "allowAnyLogId",
    "startSeqNo",
    "lastSeqNo",
    "startLogId",
    "lastLogId",
    "allowOnlyLatestSeqNo",
  ]);
  const valueTypeToProperty = {
    boolean: new Set([
      "allowAnySeqNo",
      "allowAnyLogId",
      "allowOnlyLatestSeqNo",
    ]),
    number: new Set(["startSeqNo", "lastSeqNo", "startLogId", "lastLogId"]),
  };
  for (const [key, value] of Object.entries(permission)) {
    if (
      !permissionPropertyKeys.has(key) ||
      !Object.prototype.hasOwnProperty.call(
        valueTypeToProperty,
        typeof value
      ) ||
      !valueTypeToProperty[typeof value].has(key)
    ) {
      return false;
    }
  }

  // Bisiness logic specific check.
  const specifyingLogIdRangeWhileAllowingAnyLogId =
    permission.allowAnyLogId && (permission.startLogId || permission.lastLogId);
  const specifyingSeqNoRangeWhileAllowingAnySeqNo =
    permission.allowAnySeqNo && (permission.startSeqNo || permission.lastSeqNo);
  return (
    !specifyingLogIdRangeWhileAllowingAnyLogId &&
    !specifyingSeqNoRangeWhileAllowingAnySeqNo
  );
}

/**
 * Convert request body to PermissionItem object
 *
 * `body` should be validated with validatePermission() before calling this function
 */
function convertRequestBodyToPermissionItem(body: any) {
  let permission: PermissionItem = {
    logId: {
      type: "SPECIFIED_RANGE",
    },
    seqNo: {
      type: "SPECIFIED_RANGE",
    },
  };
  permission.logId = {
    type: body.allowAnyLogId ? "ANY" : "SPECIFIED_RANGE",
    range: !body.allowAnyLogId
      ? {
          start: body.startLogId,
          last: body.lastLogId,
        }
      : undefined,
  };

  if (body.allowAnySeqNo) {
    permission.seqNo.type = "ANY";
  } else if (body.allowOnlyLatestSeqNo) {
    permission.seqNo.type = "ONLY_LATEST";
  } else {
    // type: "SPECIFIED_RANGE"
    permission.seqNo.range = {
      start: body.startSeqNo,
      last: body.lastSeqNo,
    };
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
