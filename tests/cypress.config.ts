import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
  retries: { runMode: 0, openMode: 0 },
  video: true,
  videosFolder: 'cypress/screenshots',
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*',
  },
})
