import {
  createVirtualTestnet,
  type CreateVirtualTestnetOptions,
  deleteVirtualTestnets,
  type DeleteVirtualTestnetsOptions,
} from 'support/tasks/tenderly'
import { loadEnv } from 'vite'

const env = loadEnv('', process.cwd(), '')
const tenderlyAccount =
  env.CYPRESS_TENDERLY_ACCOUNT_SLUG && env.CYPRESS_TENDERLY_PROJECT_SLUG && env.CYPRESS_TENDERLY_ACCESS_KEY
    ? {
        accountSlug: env.CYPRESS_TENDERLY_ACCOUNT_SLUG,
        projectSlug: env.CYPRESS_TENDERLY_PROJECT_SLUG,
        accessKey: env.CYPRESS_TENDERLY_ACCESS_KEY,
      }
    : undefined

export function setupNodeEvents(on: Cypress.PluginEvents) {
  on('task', {
    createVirtualTestnet(options: CreateVirtualTestnetOptions) {
      if (!tenderlyAccount) {
        return null
      }

      return createVirtualTestnet({
        ...tenderlyAccount,
        ...options,
      })
    },

    deleteVirtualTestnets(options: DeleteVirtualTestnetsOptions) {
      if (!tenderlyAccount) {
        return null
      }

      return deleteVirtualTestnets({
        ...tenderlyAccount,
        ...options,
      })
    },
  })
}
