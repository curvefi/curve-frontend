import { defineConfig } from 'cypress'
import { vitePreprocessor } from './vite-cypress-preprocessor'

export default defineConfig({
  defaultCommandTimeout: 5000,
  pageLoadTimeout: 20000,
  video: true,
  videosFolder: 'cypress/screenshots',
  watchForFileChanges: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*',
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor())
      return config
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    indexHtmlFile: 'cypress/support/component-index.html',
    supportFile: 'cypress/support/component.ts',
  },
})
