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

function validateUserId(userId: string): boolean {
  // Check if user exists
  // https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
  const usersCerts = ccfapp.typedKv(
    "public:ccf.gov.users.certs",
    ccfapp.arrayBuffer,
    ccfapp.arrayBuffer
  );
  return usersCerts.has(ccf.strToBuf(userId));
}

function isPositiveInteger(value: any): boolean {
  return Number.isInteger(value) && value > 0;
}
interface RegisterNumberRequest {
  number: string;
}

export function registerNumber(
  request: ccfapp.Request<RegisterNumberRequest>
): ccfapp.Response {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
    };
  }

  return {
    statusCode: 204,
  };
}

type PhoneNumbers = Array<string>

export function findNumbers(
  request: ccfapp.Request<PhoneNumbers>
):ccfapp.Response<PhoneNumbers> {
  return {
    body: []
  };
}