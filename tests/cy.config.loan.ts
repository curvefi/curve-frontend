import { defineConfig } from 'cypress'
import baseConfig from './cy.config.base'

const mainConfig = defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: 'http://localhost:3001/#',
    specPattern: 'cypress/e2e/loan/**/*',
  },
})

export default mainConfig
