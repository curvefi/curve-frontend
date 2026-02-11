import type { Hex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { resetWagmiConfigForTests } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { DeepPartial } from '@ui-kit/types/util'
import { tenderlyAccount } from './account'
import {
  createVirtualTestnet as createVirtualTestnetRequest,
  type CreateVirtualTestnetOptions,
  type CreateVirtualTestnetResponse,
} from './vnet-create'
import { deleteVirtualTestnet as deleteVirtualTestnetRequest } from './vnet-delete'
import {
  forkVirtualTestnet as forkVirtualTestnetRequest,
  type ForkVirtualTestnetOptions,
  type ForkVirtualTestnetResponse,
} from './vnet-fork'
import {
  getVirtualTestnet as getVirtualTestnetRequest,
  type GetVirtualTestnetOptions,
  type GetVirtualTestnetResponse,
} from './vnet-get'
import { createTenderlyWagmiConfig } from './wagmi'

/**
 * Extracts the Admin and Public RPC URLs from a Tenderly virtual testnet response.
 * @param vnet The virtual testnet response object
 */
export const getRpcUrls = (
  vnet: CreateVirtualTestnetResponse | GetVirtualTestnetResponse | ForkVirtualTestnetResponse,
) => ({
  adminRpcUrl: vnet.rpcs.find((rpc) => rpc.name === 'Admin RPC')!.url,
  publicRpcUrl: vnet.rpcs.find((rpc) => rpc.name === 'Public RPC')!.url,
})

export function createTenderlyWagmiConfigFromVNet({
  vnet,
  privateKey = generatePrivateKey(),
}: {
  vnet: CreateVirtualTestnetResponse | GetVirtualTestnetResponse | ForkVirtualTestnetResponse
  privateKey?: Hex
}) {
  const { publicRpcUrl } = getRpcUrls(vnet)
  resetWagmiConfigForTests() // fixes issues with wagmi reconnect in tests
  return createTenderlyWagmiConfig({
    privateKey,
    rpcUrl: publicRpcUrl,
    explorerUrl: publicRpcUrl,
    chainId: vnet.fork_config.network_id,
    tenderly: {
      accountSlug: tenderlyAccount.accountSlug,
      projectSlug: tenderlyAccount.projectSlug,
      accessKey: tenderlyAccount.accessKey,
      vnetId: vnet.id,
    },
  })
}

/**
 * Creates a Cypress test helper for getting virtual testnets using Tenderly.
 *
 * @param opts - A function that returns configuration options for the virtual testnet
 * @returns A function that returns the fetched virtual testnet response data
 *
 * @example
 * ```typescript
 * const getVirtualNetwork = withVirtualTestnet(() => ({ vnetid: 'your-vnet-id' }));
 *
 * it('should work with virtual testnet', () => {
 *   const virtualNetwork = getVirtualNetwork()
 *   // Use vnet in your test
 * })
 * ```
 */
export function withVirtualTestnet(opts: () => GetVirtualTestnetOptions) {
  let vnet: GetVirtualTestnetResponse

  before(() => {
    getVirtualTestnetRequest({ ...tenderlyAccount, ...opts() }).then((fetched) => (vnet = fetched))
  })

  return () => vnet
}

/**
 * Creates a Cypress test helper that creates and manages a Tenderly virtual testnet lifecycle
 *
 * @param opts - Function that returns testnet configuration options based on UUID
 * @returns Function that returns the created virtual testnet instance
 *
 * @example
 * ```typescript
 * const getVirtualNetwork = withVirtualTestnet((uuid) => ({
 *   display_name: `Custom Testnet ${uuid}`,
 *   fork_config: { network_id: 137 }
 * }))
 *
 * it('should work with virtual testnet', () => {
 *   const virtualNetwork = getVirtualNetwork()
 *   // Use vnet in your test
 * })
 * ```
 */
export function createVirtualTestnet(
  opts: (uuid: number) => DeepPartial<CreateVirtualTestnetOptions> & { chain_id?: number },
) {
  let vnet: CreateVirtualTestnetResponse
  let shouldDeleteVnet = true

  before(() => {
    const uuid = Cypress._.random(0, 1e6)
    const { chain_id = 1, ...givenOptions } = opts(uuid)

    const defaultOptions: CreateVirtualTestnetOptions = {
      slug: `testnet-${chain_id}-${uuid}`,
      display_name: `Testnet for ${chain_id} (${uuid})`,
      fork_config: { network_id: chain_id },
      virtual_network_config: { chain_config: { chain_id: chain_id } },
      sync_state_config: { enabled: false },
    }

    const options = Cypress._.merge(tenderlyAccount, defaultOptions, givenOptions)
    createVirtualTestnetRequest(options).then((created) => (vnet = created))
  })

  afterEach(function (this: Mocha.Context) {
    // delete vnet only if all tests in the current suite passed
    shouldDeleteVnet &&= this.currentTest?.state === 'passed'
  })

  after(() => {
    if (!vnet) return
    if (!shouldDeleteVnet) return console.warn(`Keeping vnet '${vnet.id}' alive because of test failures.`)
    deleteVirtualTestnetRequest({ ...tenderlyAccount, vnetId: vnet.id })
  })

  return () => vnet
}

/**
 * Creates a Cypress test helper that forks and manages a Tenderly virtual testnet lifecycle
 *
 * @param opts - Function that returns fork configuration options based on UUID
 * @returns Function that returns the forked virtual testnet instance
 *
 * @example
 * ```typescript
 * const getVirtualNetwork = forkVirtualTestnet((uuid) => ({
 *   vnet_id: 'parent-vnet-id',
 *   display_name: `Forked Testnet ${uuid}`
 * }))
 *
 * it('should work with forked virtual testnet', () => {
 *   const virtualNetwork = getVirtualNetwork()
 *   // Use vnet in your test
 * })
 * ```
 */
export function forkVirtualTestnet(
  opts: (uuid: number) => DeepPartial<ForkVirtualTestnetOptions> & Pick<ForkVirtualTestnetOptions, 'vnet_id'>,
) {
  let vnet: ForkVirtualTestnetResponse

  before(() => {
    const uuid = Cypress._.random(0, 1e6)
    const defaultOpts = { wait: true }
    const finalOpts = Cypress._.merge(tenderlyAccount, defaultOpts, opts(uuid))
    forkVirtualTestnetRequest(finalOpts).then((forked) => (vnet = forked))
  })

  after(() => {
    if (!vnet) return
    deleteVirtualTestnetRequest({ ...tenderlyAccount, vnetId: vnet.id })
  })

  return () => vnet
}
