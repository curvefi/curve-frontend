import { defineConfig } from 'cypress'
import { vitePreprocessor } from './vite-cypress-preprocessor'

export default defineConfig({
  allowCypressEnv: false,
  defaultCommandTimeout: 5000,
  pageLoadTimeout: 20000,
  video: true,
  videosFolder: 'cypress/screenshots',
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
    viewportWidth: 600,
    viewportHeight: 800,
    devServer: { framework: 'react', bundler: 'vite' },
    indexHtmlFile: 'cypress/support/component-index.html',
    supportFile: 'cypress/support/component.ts',
  },
})
