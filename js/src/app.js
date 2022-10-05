function parse_request_query(request) {
  const elements = request.query.split("&");
  const obj = {};
  for (const kv of elements) {
    const [k, v] = kv.split("=");
    obj[k] = v;
  }
  return obj;
}

export function write(request) {
  const parsedQuery = parse_request_query(request);
  if (parsedQuery.id === undefined)
  {
    return { body: { error: "Missing query parameter 'id'" } };
  }
  const id = ccf.strToBuf(parsedQuery.id);
  const params = request.body.json();

  ccf.kv["records"].set(id, ccf.strToBuf(params.msg));
  return {};
}

export function read(request) {
  const parsedQuery = parse_request_query(request);
  if (parsedQuery.id === undefined)
  {
    return { body: { error: "Missing query parameter 'id'" } };
  }
  const id = ccf.strToBuf(parsedQuery.id);

  const msg = ccf.kv["records"].get(id);
  if (msg === undefined) {
    return { body: { error: `Cannot find record for id \"${parsedQuery.id}\".` } };
  }
  return { body: ccf.bufToStr(msg) };
}