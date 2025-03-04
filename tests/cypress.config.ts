import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 15000, // todo: change back to 5s
  pageLoadTimeout: 60000, // todo: change back to 20s
  video: true,
  videosFolder: 'cypress/screenshots',
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*',
  },
})
