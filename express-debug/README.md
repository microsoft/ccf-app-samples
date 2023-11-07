# CCF Express

## Summary

This folder contains a small tool to host a CCF JS app using ExpressJS. This uses the polyfills distributed with the `ccf-app` npm package to implement the `ccf` global, and exposes HTTP routes based on the metadata from an `app.json` file.

The intention is that this can be used to debug CCF application handlers written in JavaScript or TypeScript. This does not start a multi-node network, or any enclaved code. Instead it starts a single local web server, attempting to provide the same `/app` HTTP API defined by `app.json`.

### _WARNINGS_

This is a minimal PoC, and does not provide a perfectly matching server implementation. Notable discrepancies from a CCF node at the time of writing:

- No implementation of governance endpoints. This purely serves `/app` endpoints, and any attempts at governance will return 404s. Any app state which is bootstrapped by governance may need additional genesis calls.
- Does no authentication. It attempts to construct a valid `caller` object based on fields from the incoming request, but does not validate that this represents an identity that is known and trusted in the KV.
- KV does not offer opacity or snapshot isolation. Any writes to the KV are immediately visible to other concurrently executing handlers, and writes are _not_ rolled back for failing operations.
- Error response body shape is inconsistent. This does not produce JSON OData responses for errors in the same way a CCF node does.

In short, this should only be used for testing happy-path execution flows. Any flows which rely on error responses or framework-inserted details are not supported out-of-the-box, and will require extensions to this tool.

## Issues

The approach used by this tool is to hook into the module loader (`--experimental-loader ./bundle_loader.js`) to resolve all imports directly from a single bundle file. This mirrors the CCF deployment path, ensuring all dependencies are atomically packaged, but is unnecessarily cumbersome, and leads to constant rewriting of files into a temporary `dist/` folder. Additionally it means the debugger is stepping into temporary files created within the `dist/` folder, rather than the original source files.

It should instead be possible to import modules from their original locations on the local hard drive with standard import tooling, either with dynamic `import()` (as this does), or by generating the `main.js` application ahead-of-time.

## Use

The input file for this tool is a `bundle.json`, containing the routes exposed by a CCF app and all associated JS code. This object is the one emitted by the sample `build_bundle.js`, or contained in the `bundle` field of a `set_js_app` proposal.

For instance, to run the `banking-app` sample contained in this repo:

```bash
$ cd banking-app

$ npm run build

$ cd ../express-debug

$ node --experimental-loader ./bundle_loader.js ./main.js --bundle ../banking-app/dist/bundle.json
Writing server certificate to ./service_cert.pem
CCF express app listening on :::8000!
```

Note this emits a new self-signed `service_cert.pem` used as the server identity. Clients must either obtain this, or disable TLS server authentication (`-k` to curl).

Interact with the server like any other CCF node or web server:

```bash
$ curl https://localhost:8000/app/balance/bob --cacert ./service_cert.pem
```

## VSCode integration

To launch this tool with the VSCode debugger attached, add a VSCode launch configuration (to `.vscode/launch.json`) based on the following snippet:

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/express-debug/",
      "name": "Host current bundle with ExpressJS",
      "skipFiles": ["<node_internals>/**"],
      "args": ["--bundle", "${file}"],
      "runtimeArgs": [
        "--experimental-loader",
        "${workspaceFolder}/express-debug/bundle_loader.js"
      ],
      "program": "${workspaceFolder}/express-debug/main.js"
    }
  ]
}
```

To use this configuration, first select a `bundle.json` as the active file, and then then run this configuration from VSCode's Run and Debug tab. Note that while the `bundle_loader.js` is used to resolve imports, the debugger is executing the source under `dist/` - breakpoints must be placed in the appropriate files.
