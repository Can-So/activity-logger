const fs = require('fs');
const Mocha = require('mocha');
const path = require('path');
const { API_PATH, SERVER_PORT } = require('./src/constants');

// Global for all test files
apiUrl = `${API_PATH}:${SERVER_PORT}`;

const { TEST_SUB_DIR } = process.env;

// Instantiate a Mocha instance.
const mocha = new Mocha({
  timeout: 300000
});

// Buuld the test suite collecting files to execute
if (TEST_SUB_DIR) {
  buildTestSuite(`./test/${TEST_SUB_DIR}`);
} else {
  buildTestSuite('../test');
}

runTestSuite();

/**
 * Add test files in specific suite to the mocha suite
 * @param {String} testDir which dir to build the test files from
 */
function buildTestSuite(testDir) {
  fs.readdirSync(testDir).filter((file) => {
    return file.substr(-3) === '.js';

  }).forEach((file) => {
      mocha.addFile(
          path.join(testDir, file)
      );
  });
}

async function runTestSuite() {
  mocha.run(async (failures) => {
    process.exit(failures);
  });
}