import * as ccfapp from "@microsoft/ccf-app";

interface RegisterNumberRequest {
  number: string;
}

// Set of registered hashed numbers.
// The type of value can be anything since we don't use it.
const registeredNumbers = ccfapp.typedKv(`numbers`, ccfapp.string, ccfapp.bool);

function validateHashedNumber(number: any): boolean {
  return typeof number === "string";
}

function validateHashedNumbers(numbers: any): boolean {
  if (!Array.isArray(numbers)) {
    return false;
  }

  for (const number of numbers) {
    if (!validateHashedNumber(number)) {
      return false;
    }
  }

  return true;
}

export function registerNumber(
  request: ccfapp.Request<RegisterNumberRequest>
): ccfapp.Response {
  const uriDecodedHashedNumber = request.params.hashed_number;
  let hashedNumber;
  try {
    hashedNumber = decodeURIComponent(uriDecodedHashedNumber);
  } catch (error) {
    return {
      statusCode: 400,
    };
  }

  if (!validateHashedNumber(hashedNumber)) {
    return {
      statusCode: 400,
    };
  }

  registeredNumbers.set(hashedNumber, true);

  return {
    statusCode: 204,
  };
}

type PhoneNumbers = Array<string>;

export function findNumbers(
  request: ccfapp.Request<PhoneNumbers>
): ccfapp.Response<PhoneNumbers> {
  let body;
  try {
    body = request.body.json();
  } catch {
    return {
      statusCode: 400,
    };
  }

  if (!validateHashedNumbers(body)) {
    return {
      statusCode: 400,
    };
  }

  const numbers = body as PhoneNumbers;

  let foundNumbers = [];
  for (const number of numbers) {
    if (registeredNumbers.has(number)) {
      foundNumbers.push(number);
    }
  }

  return {
    body: foundNumbers,
  };
}
