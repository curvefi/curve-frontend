import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 5000,
  pageLoadTimeout: 20000,
  video: true,
  videosFolder: 'cypress/screenshots',
  watchForFileChanges: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*',
  },
})
