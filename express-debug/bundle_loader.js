import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";

import yargs from "yargs";

console.info(process.argv);
const argv = yargs(process.argv.slice(2)).option("bundle", {
  describe: "JSON bundle describing application to host",
  type: "string",
  demandOption: true,
}).argv;

const bundlePath = argv.bundle;
const bundle = JSON.parse(readFileSync(bundlePath, "utf-8"));

const modules = {};
for (let moduleDef of bundle.modules) {
  modules[moduleDef.name] = moduleDef.module;
}

export async function resolve(specifier, context, nextResolve) {
  const targetRoot = path.join(process.cwd(), `dist`);
  let originalSpecifier = specifier;

  if (context.parentURL) {
    let canonicalSpecifier = context.parentURL;
    if (context.parentURL.startsWith("file://")) {
      canonicalSpecifier = context.parentURL.substr(7);
    }
    canonicalSpecifier = path.resolve(
      path.dirname(canonicalSpecifier),
      specifier
    );
    canonicalSpecifier = path.relative(targetRoot, canonicalSpecifier);
    specifier = canonicalSpecifier;

    // Result should not be relative
    if (specifier.startsWith("../")) {
      specifier = specifier.substr(3);
    }
  }

  if (specifier in modules) {
    const modulePath = path.join(targetRoot, specifier);
    const targetDir = path.dirname(modulePath);
    if (!existsSync(targetDir)) {
      //console.debug(`Creating dir ${targetDir}`);
      mkdirSync(targetDir, { recursive: true });
    }

    //console.debug(`Writing local module ${modulePath}`);
    writeFileSync(modulePath, modules[specifier]);
    return {
      shortCircuit: true,
      url: new URL(`file:${modulePath}`).href,
      format: "module",
    };
  }

  return nextResolve(originalSpecifier, context);
}
