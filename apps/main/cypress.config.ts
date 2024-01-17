import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 24000,
  experimentalMemoryManagement: true,
  requestTimeout: 30000,
  retries: { runMode: 2 },
  videoCompression: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
  },
})
