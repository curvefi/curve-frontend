import { defineConfig } from 'cypress'
import baseConfig from './cy.config.base'

const lendConfig = defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: 'http://localhost:3003/#',
    specPattern: 'cypress/e2e/lend/**/*',
  },
})

export default lendConfig
