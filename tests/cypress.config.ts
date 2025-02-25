import { defineConfig } from 'cypress'

// the app can hang sometimes during the CI run, with error [HMR] Invalid message: {"action":"appIsrManifest","data":{}} TypeError: Cannot read properties of undefined (reading 'pathname')
// todo: disable HMR during tests
const retries = { runMode: 2, openMode: 0 }

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
