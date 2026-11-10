import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'cypress'
import type { TestnetAccount, TestnetConfig } from './cypress/support/helpers/stellar/stellar-testnet.config'
import { deployStellarStandalone } from './cypress/tasks/stellar-standalone'
import { createTestnetDeployer, type TestnetDeployment } from './cypress/tasks/stellar-testnet'
import { vitePreprocessor } from './vite-cypress-preprocessor'
import { assert } from '@primitives/objects.utils'

const testSeed = (process.env.TEST_SEED = process.env.TEST_SEED?.trim() || randomUUID())
console.info(`Cypress test seed: ${testSeed}`)

export default defineConfig({
  // Temporary workaround for Chrome network stalls/reloads.
  // https://github.com/cypress-io/cypress/issues/34969 https://github.com/cypress-io/cypress/issues/34158
  forceHttp1: true,
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
    viewportWidth: 600,
    viewportHeight: 800,
    devServer: { framework: 'react', bundler: 'vite' },
    indexHtmlFile: 'cypress/support/component-index.html',
    supportFile: 'cypress/support/component.ts',
    async setupNodeEvents(on, config) {
      const standaloneDeployment =
        process.env.STELLAR_STANDALONE === 'true' ? await deployStellarStandalone() : undefined
      let deployerPromise: Promise<TestnetAccount> | undefined
      // Capture network failures during module loading in the existing failure artifacts.
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && config.screenshotsFolder) {
          mkdirSync(config.screenshotsFolder, { recursive: true })
          launchOptions.args.push(
            `--log-net-log=${resolve(config.screenshotsFolder, `chrome-netlog-${randomUUID()}.json`)}`,
          )
        }
        return launchOptions
      })
      on('before:run', () => {
        deployerPromise = undefined
      })
      on('task', {
        // cy.log only reaches the command log, this prints to the terminal (and CI output)
        log: (message: string) => {
          console.info(message)
          return null
        },
        getStellarTestnetConfig: async (rpcUrl: string): Promise<TestnetConfig> => {
          const deployment: TestnetDeployment = assert(
            standaloneDeployment ?? config.env.STELLAR_TESTNET_CONFIG,
            'STELLAR_TESTNET_CONFIG environment variable is not set',
          )
          deployerPromise ??= createTestnetDeployer(deployment, rpcUrl)
          return {
            deployer: await deployerPromise,
            issuer: { address: deployment.issuer.address },
            factory: deployment.factory,
            coins: deployment.coins,
          }
        },
      })
      return config
    },
  },
})
