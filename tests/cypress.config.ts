import { defineConfig } from 'cypress'

export default defineConfig({
  viewportWidth: 1000,
  viewportHeight: 800,
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 120000,
  requestTimeout: 30000,
  retries: { runMode: 0, openMode: 0 },
  scrollBehavior: 'center',
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*',
  },
})
