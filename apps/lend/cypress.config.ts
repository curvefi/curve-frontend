import { defineConfig } from 'cypress'

export default defineConfig({
  viewportWidth: 1000,
  viewportHeight: 800,
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 120000,
  requestTimeout: 30000,
  retries: { runMode: 2, openMode: 0 },
  scrollBehavior: 'center',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3003/#',
  },
})
