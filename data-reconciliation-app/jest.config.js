/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["./src/**/*.ts"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "test/coverage",

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node",
  ],

  // A preset that is used as a base for Jest's configuration
  // preset: undefined,
  // preset: 'ts-jest',

  // A list of paths to directories that Jest should use to search for files in
  roots: ["./"],

  // The test environment that will be used for testing
  testEnvironment: "node",

  testMatch: ["**/test/unit-test/**/*.test.(ts|js|mjs)"],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],

  // This option allows use of a custom test runner
  // testRunner: "jest-circus/runner",

  // A map from regular expressions to paths to transformers
  // transform: undefined,
  transform: { "^.+\\.ts$": "ts-jest" },

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};
