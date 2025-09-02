import { generatePrivateKey } from 'viem/accounts'
import { createTestWagmiConfig } from '../wagmi'
import { tenderlyAccount } from './account'
import type { DeepPartial } from './types'
import {
  createVirtualTestnet as createVirtualTestnetRequest,
  type CreateVirtualTestnetOptions,
  type CreateVirtualTestnetResponse,
} from './vnet-create'
import { deleteVirtualTestnet as deleteVirtualTestnetRequest, type DeleteVirtualTestnetOptions } from './vnet-delete'
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

export function createTestWagmiConfigFromVNet(vnet: CreateVirtualTestnetResponse | GetVirtualTestnetResponse) {
  const rpcUrl = vnet.rpcs.find((rpc) => rpc.name === 'Admin RPC')?.url
  const explorerUrl = vnet.rpcs.find((rpc) => rpc.name === 'Public RPC')?.url

  if (!rpcUrl) throw new Error('RPC URL is undefined')

  return createTestWagmiConfig({
    privateKey: generatePrivateKey(),
    rpcUrl,
    explorerUrl,
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
    if (!tenderlyAccount) {
      cy.log('Tenderly credentials not configured, skipping virtual testnet fetching')
      return
    }

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
export function createVirtualTestnet(opts: (uuid: number) => DeepPartial<CreateVirtualTestnetOptions>) {
  let vnet: CreateVirtualTestnetResponse

  before(() => {
    if (!tenderlyAccount) {
      cy.log('Tenderly credentials not configured, skipping virtual testnet creation')
      return
    }

    const uuid = Cypress._.random(0, 1e6)

    const defaultOpts: CreateVirtualTestnetOptions = {
      slug: `testnet-${uuid}`,
      display_name: `Testnet ${uuid}`,
      fork_config: {
        network_id: 1,
      },
      virtual_network_config: {
        chain_config: { chain_id: 1 },
      },
      sync_state_config: { enabled: false },
    }

    const finalOpts = Cypress._.merge({}, defaultOpts, opts(uuid))

    createVirtualTestnetRequest({ ...tenderlyAccount, ...finalOpts }).then((created) => (vnet = created))
  })

  after(() => {
    if (!vnet) return

    const deleteOpts: DeleteVirtualTestnetOptions = {
      vnetId: vnet.id,
    }

    deleteVirtualTestnetRequest({ ...tenderlyAccount!, ...deleteOpts })
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
    if (!tenderlyAccount) {
      cy.log('Tenderly credentials not configured, skipping virtual testnet forking')
      return
    }

    const uuid = Cypress._.random(0, 1e6)

    const defaultOpts: Partial<ForkVirtualTestnetOptions> = {
      wait: true,
    }

    const finalOpts = Cypress._.merge({}, defaultOpts, opts(uuid))

    forkVirtualTestnetRequest({ ...tenderlyAccount, ...finalOpts }).then((forked) => (vnet = forked))
  })

  after(() => {
    if (!vnet) return

    const deleteOpts: DeleteVirtualTestnetOptions = {
      vnetId: vnet.id,
    }

    deleteVirtualTestnetRequest({ ...tenderlyAccount!, ...deleteOpts })
  })

  return () => vnet
}
