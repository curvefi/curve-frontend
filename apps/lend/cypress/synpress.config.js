const { defineConfig } = require("cypress");
const setupNodeEvents = require("@synthetixio/synpress/plugins/index");
const supportFile = "cypress/support/e2e.ts";
const timeout = 30000;

module.exports = defineConfig({
  userAgent: "synpress",
  retries: {
    runMode: 1,
    openMode: 0,
  },
  fixturesFolder: "@synthetixio/synpress/fixtures",
  chromeWebSecurity: true,
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  env: {
    coverage: false,
  },
  defaultCommandTimeout: timeout,
  pageLoadTimeout: timeout,
  requestTimeout: timeout,
  e2e: {
    testIsolation: false,
    setupNodeEvents,
    baseUrl: "http://localhost:3003",
    specPattern: "cypress/e2e/**/*.{ts,tsx}",
    supportFile,
  },
});
