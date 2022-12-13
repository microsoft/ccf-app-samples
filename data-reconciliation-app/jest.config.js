export default {
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',
  
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    },
  },
  // An array of file extensions your modules use
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  // A map from regular expressions to paths to transformers
  transform: { '^.+\\.ts$': 'ts-jest' },
  // A list of paths to directories that Jest should use to search for files in
  roots: ['./'],
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  // The glob patterns Jest uses to detect test files
  testMatch: ["**/test/unit-test/*.test.(ts|js)"],
  
  // The test environment that will be used for testing
  testEnvironment: "jest-environment-node",
  
  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [ "node_modules" ],
  
  //  An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [ './src/**/*.ts' ],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
   // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  
  // A list of reporter names that Jest uses when writing coverage reports
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  //globalSetup: './test/unit-test/setup.ts',
};