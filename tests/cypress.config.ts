import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 5000,
  pageLoadTimeout: 20000,
  retries,
  video: true,
  videosFolder: 'cypress/screenshots',
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*',
  },
})
