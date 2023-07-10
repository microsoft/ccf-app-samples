// Take a bundle.json file, start a corresponding Express server

// Use ccf polyfill to populate global ccf object
import "@microsoft/ccf-app/polyfill.js";

import { readFileSync, writeFileSync } from "fs";

import express from "express";
import yargs from "yargs";
import pem from "pem";
import https from "https";
import jwt from "jsonwebtoken";

const argv = yargs(process.argv.slice(2))
  .option("bundle", {
    describe: "JSON bundle describing application to host",
    type: "string",
    demandOption: true,
  })
  .option("cert", {
    describe:
      "Path where freshly created, self-signed service cert will be written",
    type: "string",
    default: "./service_cert.pem",
  })
  .option("port", {
    describe: "Port to host server on",
    type: "int",
    default: 8000,
  })
  .strict().argv;

const bundlePath = argv.bundle;
const bundle = JSON.parse(readFileSync(bundlePath, "utf-8"));
const metadata = bundle.metadata;

let appRouter = express.Router();

const routeConverter = {
  // Convert an express-style templated path to a CCF path.
  // eg /hello/:id/:place -> /hello/{id}/{place}
  e2c: function (path) {
    const re = /:([^\/]*)/g;
    return path.replaceAll(re, "{$1}");
  },

  // Convert an CCF-style templated path to an express path.
  // eg /hello/{id}/{place} -> /hello/:id/:place
  c2e: function (path) {
    const re = /{([^/]*)}/g;
    return path.replaceAll(re, ":$1");
  },
};

function ccfIdFromPem(cert) {
  return cert.fingerprint256.replaceAll(":", "").toLowerCase();
}

function populateCaller(req, policies) {
  // Note this does not _apply_ the auth policy. It only tries to construct a
  // caller object of the correct shape, based on the specified policies and
  // incoming request
  for (let policy of policies) {
    let caller = { policy: policy };
    if (policy === "no_auth") {
      return caller;
    } else if (policy === "jwt") {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const decoded = jwt.decode(authHeader.replace("Bearer ", ""), {
          json: true,
          complete: true,
        });
        caller.jwt = {
          keyIssuer: "NOT VALIDATED",
          header: decoded.header,
          payload: decoded.payload,
        };
        return caller;
      }
    } else if (policy === "user_cert" || policy === "member_cert") {
      const peerCert = req.client.getPeerX509Certificate();
      if (peerCert !== undefined) {
        caller.cert = peerCert;
        caller.id = ccfIdFromPem(peerCert);
        return caller;
      }
    } else if (policy === "user_cose_sign1") {
      console.error("Igoring unimplemented user_cose_sign1 caller");
      continue;
    }
  }

  return null;
}

function ccfMiddleware(req, res, next) {
  const rawBody = req.body;
  req.body = {
    text: function () {
      return rawBody.toString("utf8");
    },
    json: function () {
      return JSON.parse(rawBody);
    },
    arrayBuffer: function () {
      return new ArrayBuffer(rawBody);
    },
  };

  // CCF expects bare query string
  req.query = req._parsedUrl.query || "";

  next();
}
appRouter.use(
  express.raw({
    type: function (req) {
      return true;
    },
  }),
  ccfMiddleware
);

for (let [path, pathObject] of Object.entries(metadata.endpoints)) {
  let route = appRouter.route(routeConverter.c2e(path));
  for (let [method, methodObject] of Object.entries(pathObject)) {
    route[method](async (req, res) => {
      const module = await import(methodObject.js_module);
      const handler = module[methodObject.js_function];

      try {
        // Convert route to CCF format
        req.route = routeConverter.e2c(req.route.path);

        // Populate req.caller
        req.caller = populateCaller(req, methodObject.authn_policies);

        // Call handler
        const response = handler(req);

        // TODO: Fill fields in same way CCF does
        const statusCode = response.statusCode || (response.body ? 200 : 204);
        res.status(statusCode);
        res.set("content-type", "application/json");
        res.send(response.body);
      } catch (error) {
        // TODO: Convert to CCF-style errors
        console.error(`Error while executing ${method} ${path}: ${error}`);
        res.status(500);
        res.send(`Execution error: ${error}`);
      }
    });
  }
}

// All CCF app endpoints are nested under /app - so tell express to
// use our generated router at prefix "/app"
const expressApp = express();
expressApp.use("/app", appRouter);

const port = argv.port;

pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {
    console.error(`Error creating certificate: ${err.message}`);
    process.exit(1);
  }

  console.log(`Writing server certificate to ${argv.cert}`);
  writeFileSync(argv.cert, keys.certificate);

  const server = https
    .createServer(
      {
        key: keys.clientKey,
        cert: keys.certificate,
        // Store client cert if provided, but don't auto-reject it
        requestCert: true,
        rejectUnauthorized: false,
      },
      expressApp
    )
    .listen(port);
  console.log(
    `CCF express app listening on ${server.address().address}:${
      server.address().port
    }!`
  );
});
