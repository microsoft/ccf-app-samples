import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";


function getAccountTable (userId: string): ccfapp.TypedKvMap<string, number> {
  return ccfapp.typedKv(`user_accounts:${userId}`, ccfapp.string, ccfapp.uint32);
}

interface Caller {
  id: string
}

function getCallerId (request: ccfapp.Request<any>): string {
  // Note that the following way of getting caller ID doesn't work for 'jwt' auth policy and 'no_auth' auth policy.
  const caller = request.caller as unknown as Caller;
  return caller.id;
}

function validateUserId (userId: string): boolean {
  // Check if user exists
  // https://microsoft.github.io/CCF/main/audit/builtin_maps.html#users-info
  const usersCerts = ccfapp.typedKv("public:ccf.gov.users.certs", ccfapp.arrayBuffer, ccfapp.arrayBuffer);
  return usersCerts.has(ccf.strToBuf(userId));
}

function isPositiveInteger (value: any): boolean {
  return Number.isInteger(value) && value > 0;
}

type CreateAccountRequest = null;
type CreateAccountResponse = null;

export function createAccount(
  request: ccfapp.Request<CreateAccountRequest>
): ccfapp.Response<CreateAccountResponse> {
  const userId = request.params.user_id;
  if (!validateUserId(userId)) {
    return {
      statusCode: 404
    };
  }

  const accountToBalance = getAccountTable(userId);

  const accountName = request.params.account_name;

  if (accountToBalance.has(accountName)) {
    // Nothing to do
    return { 
      statusCode: 204
    };
  }

  // Initial balance should be 0.
  accountToBalance.set(accountName, 0);

  console.log('Create Account Completed');

  return { 
    statusCode: 204
  };
}

interface DepositRequest {
  value: number
}

type DepositResponse = null;

export function deposit(
  request: ccfapp.Request<DepositRequest>
): ccfapp.Response<DepositResponse> {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400
    };
  }

  const value = body.value

  if (!isPositiveInteger(value)) {
    return {
      statusCode: 400
    };
  }

  const userId = request.params.user_id;
  if (!validateUserId(userId)) {
    return {
      statusCode: 404
    };
  }

  const accountName = request.params.account_name;

  const accountToBalance = getAccountTable(userId);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 }; 
  }

  accountToBalance.set(accountName, accountToBalance.get(accountName) + value);

  console.log('Deposit Completed');

  return { 
    statusCode: 204
  };
}

type BalanceRequest = null;

interface BalanceResponse {
  balance: number
}

export function balance(
  request: ccfapp.Request<BalanceRequest>
): ccfapp.Response<BalanceResponse> {
  const userId = getCallerId(request);

  const accountName = request.params.account_name;
  const accountToBalance = getAccountTable(userId);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 }; 
  }

  return { body: { balance: accountToBalance.get(accountName) } };
}

interface TransferRequest {
  value: number
  user_id_to: string
  account_name_to: string
}

type TransferResponse = string;

export function transfer(
  request: ccfapp.Request<TransferRequest>
): ccfapp.Response<TransferResponse> {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400
    };
  }

  const value = body.value

  if (!isPositiveInteger(value)) {
    return {
      statusCode: 400
    };
  }

  const userId = getCallerId(request);

  const accountName = request.params.account_name;
  const accountNameTo = body.account_name_to;

  const userIdTo = body.user_id_to;

  if (!validateUserId(userIdTo)) {
    return {
      statusCode: 404
    };
  }

  const accountToBalance = getAccountTable(userId);
  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 }; 
  }

  const accountToBalanceTo = getAccountTable(userIdTo);
  if (!accountToBalanceTo.has(accountNameTo)) {
    return { statusCode: 404 }; 
  }

  const balance = accountToBalance.get(accountName);

  if (value > balance)
  {
    return { statusCode: 400, body: "Balance is not enough" };
  }

  accountToBalance.set(accountName, balance - value);
  accountToBalanceTo.set(accountNameTo, accountToBalanceTo.get(accountNameTo) + value);

  const recordClaim = ccf.digest("SHA-256", ccf.strToBuf(`${userId} sent ${value} to ${userIdTo}`));
  ccf.rpc.setClaimsDigest(recordClaim);

  console.log('Transfer Completed');

  return { 
    statusCode: 204
  };
}
