import { defineConfig } from 'cypress'

const envConfig = {
  main: {
    baseUrl: 'http://localhost:3000/#',
    specPattern: 'cypress/e2e/(main|all)/**/*',
  },
  lend: {
    baseUrl: 'http://localhost:3003/#',
    specPattern: 'cypress/e2e/(lend|all)/**/*',
  },
  loan: {
    baseUrl: 'http://localhost:3001/#',
    specPattern: 'cypress/e2e/(loan|all)/**/*',
  },
} as const

const APP = process.env.CYPRESS_DAPP ?? 'main'

export default defineConfig({
  viewportWidth: 1000,
  viewportHeight: 800,
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 120000,
  requestTimeout: 30000,
  retries: { runMode: 2, openMode: 0 },
  scrollBehavior: 'center',
  e2e: {
    setupNodeEvents(on, config) {},
    env: { APP },
    ...envConfig[APP as keyof typeof envConfig],
  },
})
