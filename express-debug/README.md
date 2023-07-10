# CCF Express

## Summary
This folder contains a small tool to host a CCF JS app using ExpressJS. This uses the polyfills distributed with the `ccf-app` npm package to implement the `ccf` global, and exposes HTTP routes based on the metadata from an `app.json` file.

The intention is that this can be used to debug CCF application handlers written in JavaScript or TypeScript. This does not start a multi-node network, or any enclaved code. Instead it starts a single local web server, attempting to provide the same `/app` HTTP API defined by `app.json`.

### *WARNINGS*
This is a minimal PoC, and does not provide a perfectly matching server implementation. Notable discrepancies from a CCF node at the time of writing:
- No implementation of governance endpoints. This purely serves `/app` endpoints, and any attempts at governance will return 404s. Any app state which is bootstrapped by governance may need additional genesis calls.
- Does no authentication. It attempts to construct a valid `caller` object based on fields from the incoming request, but does not validate that this represents an identity that is known and trusted in the KV.
- KV does not offer opacity or snapshot isolation. Any writes to the KV are immediately visible to other concurrently executing handlers, and writes are _not_ rolled back for failing operations.
- Error response body shape is inconsistent. This does not produce JSON OData responses for errors in the same way a CCF node does.

In short, this should only be used for testing happy-path execution flows. Any flows which rely on error responses or framework-inserted details are not supported out-of-the-box, and will require extensions to this tool.

## Issues

The approach used by this tool is to hook into the module loader (`--experimental-loader ./bundle_loader.js`) to resolve all imports directly from a single bundle file. This mirrors the CCF deployment path, ensuring all dependencies are atomically packaged, but is unnecessarily cumbersome, and leads to constant churn in the working `dist/` folder. Additionally it means the debugger is stepping into temporary files created within the `dist/` folder, rather than the original source files.

It should instead be possible to import modules from their original locations on the local hard drive with standard import tooling, either with dynamic `import()` (as this does), or by generating the `main.js` application ahead-of-time.

## Use

The input file for this tool is a `bundle.json`, containing the routes exposed by a CCF app and all associated JS code. This object is the one emitted by the sample `build_bundle.js`, or contained in the `bundle` field of a `set_js_app` proposal.

A minimal example looks something like this:
```json
{
  "metadata": {
    "endpoints": {
      "/increment/{id}": {
        "post": {
          "js_module": "endpoints/increment.js",
          "js_function": "increment",
          "forwarding_required": "sometimes",
          "authn_policies": [],
          "mode": "readwrite",
          "openapi": {}
        }
      },
      "/count/{id}": {
        "get": {
          "js_module": "endpoints/count.js",
          "js_function": "count",
          "forwarding_required": "sometimes",
          "authn_policies": [],
          "mode": "readwrite",
          "openapi": {}
        }
      }
    }
  },
  "modules": [
    {
      "name": "endpoints/all.js",
      "module": "export { increment } from './increment.js';\nexport { count } from './count.js';\n"
    },
    {
      "name": "endpoints/count.js",
      "module": "import { ccf } from '../js/ccf-app/global.js';\n\nfunction count(request) {\n    let counts = ccf.kv[\"counts\"];\n    const id = ccf.jsonCompatibleToBuf(request.params.id);\n    if (counts.has(id)) {\n        return {\n            body: {\n                count: ccf.bufToJsonCompatible(counts.get(id))\n            }\n        };\n    }\n    else {\n        return {\n            statusCode: 404,\n            body: `No count found for ${request.params.id}`\n        };\n    }\n}\n\nexport { count };\n"
    },
    {
      "name": "endpoints/increment.js",
      "module": "import { ccf } from '../js/ccf-app/global.js';\n\nfunction increment(request) {\n    let counts = ccf.kv[\"counts\"];\n    const id = ccf.jsonCompatibleToBuf(request.params.id);\n    const prevCount = counts.has(id) ? ccf.bufToJsonCompatible(counts.get(id)) : 0;\n    counts.set(id, ccf.jsonCompatibleToBuf(prevCount + 1));\n    return {};\n}\n\nexport { increment };\n"
    },
    {
      "name": "js/ccf-app/global.js",
      "module": "// Copyright (c) Microsoft Corporation. All rights reserved.\n// Licensed under the Apache 2.0 License.\n/**\n * This module describes the global {@linkcode ccf} variable.\n * Direct access of this module or the {@linkcode ccf} variable is\n * typically not needed as all of its functionality is exposed\n * via other, often more high-level, modules.\n *\n * Accessing the {@linkcode ccf} global in a type-safe way is done\n * as follows:\n *\n * ```\n * import { ccf } from '@microsoft/ccf-app/global.js';\n * ```\n *\n * @module\n */\n// The global ccf variable and associated types are exported\n// as a regular module instead of using an ambient namespace\n// in a .d.ts definition file.\n// This avoids polluting the global namespace.\nconst ccf = globalThis.ccf;\n\nexport { ccf };\n"
    }
  ]
}
```

This contains metadata describing 2 endpoints (`POST /app/increment/{id}` and `GET /app/count/{id}`), the source files which implement them, and the modules they depend on.

If the file above is in `my_bundle.json`, and we've run `npm install`, then this can be launched with:

```bash
$ node --experimental-loader ./bundle_loader.js ./host.js --bundle ./my_bundle.json
Writing server certificate to ./service_cert.pem
CCF express app listening on :::8000!
```

Note this emits a new self-signed `service_cert.pem` used as the server identity. Clients must either obtain this, or disable TLS server authentication (`-k` to curl).

Interact with the server like any other CCF node or web server:

```bash
$ curl https://localhost:8000/app/count/foo --cacert ./service_cert.pem 
No count found for foo

$ curl https://localhost:8000/app/increment/foo -k -X POST
$ curl https://localhost:8000/app/count/foo -k
{"count":1}

$ curl https://localhost:8000/app/increment/foo --cacert ./service_cert.pem -X POST
$ curl https://localhost:8000/app/increment/foo --cacert ./service_cert.pem -X POST
$ curl https://localhost:8000/app/count/foo --cacert ./service_cert.pem
{"count":3}
```

## VSCode integration

This folder contains a [`.vscode/launch.json`](.vscode/launch.json) demonstrating how this tool may be hooked up to the VSCode debugger.

To use this configuration, first select a `bundle.json` as the active file, and then then run this configuration from VSCode's Run and Debug tab. For instance if `my_bundle.json` is the active window, then this configuration will launch `node --experimental-loader ./bundle_loader.js ./host.js --bundle ./my_bundle.json` with the VSCode debugger attached. Note that while the `bundle_loader.js` is used to resolve imports, the debugger is executing the source under `dist/` - breakpoints must be placed in the appropriate file.