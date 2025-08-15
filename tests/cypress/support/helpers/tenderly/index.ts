export * from './types'
export {
  createVirtualTestnet,
  type CreateVirtualTestnetOptions,
  type CreateVirtualTestnetResponse,
} from './vnet-create'
export { deleteVirtualTestnets, type DeleteVirtualTestnetsOptions } from './vnet-delete'
export { withVirtualTestnet, createTestWagmiConfigFromVNet } from './vnet'

const accountSlug = Cypress.env('TENDERLY_ACCOUNT_SLUG')
const projectSlug = Cypress.env('TENDERLY_PROJECT_SLUG')
const accessKey = Cypress.env('TENDERLY_ACCESS_KEY')

export const tenderlyAccount =
  accountSlug && projectSlug && accessKey ? { accountSlug, projectSlug, accessKey } : undefined
