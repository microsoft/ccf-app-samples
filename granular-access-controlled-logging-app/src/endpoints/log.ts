import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";

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

interface PermissionItem {
  allowAnySeqNo: boolean;
  allowAnyLogId: boolean;
  startSeqno?: number;
  endSeqno?: number;
  startLogId?: number;
  endLogId?: number;
}

const permissionTableName = "log_access_permissions";
const userIdToPermission = ccfapp.typedKv(
  permissionTableName,
  ccfapp.string /** User ID */,
  ccfapp.json<PermissionItem>()
);

function checkUserAccess(userId: string, logId: number): boolean {
  // TODO: handle historical query

  // Access is not allowed if perssion is not set explicitly.
  if (!userIdToPermission.has(userId)) {
    return false;
  }

  const permission = userIdToPermission.get(userId);
  if (permission.allowAnyLogId) {
    return true;
  } else if (
    (permission.startLogId === undefined &&
      permission.endLogId === undefined) ||
    (permission.startLogId !== undefined && permission.startLogId > logId) ||
    (permission.endLogId !== undefined && permission.endLogId < logId)
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

export function getLogItem(request: ccfapp.Request): ccfapp.Response<LogItem> {
  const id = parseInt(request.query.split("=")[1]);

  const callerId = getCallerId(request);
  if (
    !(isMember(callerId) || (isUser(callerId) && checkUserAccess(callerId, id)))
  ) {
    return {
      statusCode: 403,
    };
  }
  if (!logMap.has(id)) {
    return {
      statusCode: 404,
    };
  }
  return {
    body: logMap.get(id),
  };
}

export function setLogItem(request: ccfapp.Request<LogItem>): ccfapp.Response {
  const id = parseInt(request.query.split("=")[1]);
  logMap.set(id, request.body.json());
  return {};
}

function validatePermission(permission: unknown): boolean {
  // TODO: improve check
  const permissionPropertyKeys = new Set([
    "allowAnySeqNo",
    "allowAnyLogId",
    "startSeqno",
    "endSeqno",
    "startLogId",
    "endLogId",
  ]);
  const booleanKeys = new Set(["allowAnySeqNo", "allowAnyLogId"]);
  const numberKeys = new Set([
    "startSeqno",
    "endSeqno",
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

  const p = permission as PermissionItem;
  if (p.allowAnyLogId === true) {
    if (p.startLogId || p.endLogId) {
      return false;
    }
  }
  if (p.allowAnySeqNo === true) {
    if (p.startSeqno || p.endSeqno) {
      return false;
    }
  }

  return true;
}

function convertRequestBodyToPermissionItem(body: any) {
  // `body` should be validated with validatePermission() before calling this function
  let permission = Object.assign({}, body);
  permission.allowAnyLogId = permission.allowAnyLogId
    ? permission.allowAnyLogId
    : false;
  permission.allowAnySeqNo = permission.allowAnySeqNo
    ? permission.allowAnySeqNo
    : false;
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
