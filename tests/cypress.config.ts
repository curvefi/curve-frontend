import { defineConfig } from 'cypress'

const commonConfig = defineConfig({
  viewportWidth: 1000,
  viewportHeight: 1000,
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 120000,
  requestTimeout: 30000,
  retries: { runMode: 2, openMode: 0 },
  scrollBehavior: 'center',
  e2e: {
    setupNodeEvents(on, config) {},
  },
})

interface EnvConfig {
  [key: string]: {
    baseUrl: string
    specPattern: string
  }
}

const envConfig: EnvConfig = {
  main: {
    baseUrl: 'http://localhost:3000/#',
    specPattern: 'cypress/e2e/main/**/*',
  },
  lend: {
    baseUrl: 'http://localhost:3003/#',
    specPattern: 'cypress/e2e/lend/**/*',
  },
  loan: {
    baseUrl: 'http://localhost:3001/#',
    specPattern: 'cypress/e2e/loan/**/*',
  },
}

const selectedDapp = envConfig[process.env.CYPRESS_DAPP ?? 'main']

export default defineConfig({
  ...commonConfig,
  e2e: {
    ...commonConfig.e2e,
    ...selectedDapp,
  },
})
