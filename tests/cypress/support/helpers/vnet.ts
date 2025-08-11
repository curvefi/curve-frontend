import { generatePrivateKey } from 'viem/accounts'
import type {
  CreateVirtualTestnetOptions,
  CreateVirtualTestnetResponse,
  DeleteVirtualTestnetsOptions,
} from '../tasks/tenderly'
import { createTestWagmiConfig } from './wagmi'

/**
 * Creates a Wagmi configuration for testing from a Tenderly virtual testnet response
 *
 * @param vnet - Virtual testnet response from Tenderly
 * @returns Configured Wagmi config instance or undefined if vnet is invalid
 * @throws Error when RPC URL is not found in the virtual testnet response
 */
export function createTestWagmiConfigFromVNet(vnet: CreateVirtualTestnetResponse) {
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
 * Creates a deep partial type that makes all properties optional recursively,
 * while preserving function types as-is
 *
 * @template T - The type to make deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]>) : T[P]
}

/**
/**
 * Creates a Cypress test helper that manages a Tenderly virtual testnet lifecycle
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
export function withVirtualTestnet(opts: (uuid: number) => DeepPartial<CreateVirtualTestnetOptions>) {
  let vnet: CreateVirtualTestnetResponse

  before(() => {
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

    cy.task('createVirtualTestnet', finalOpts).then((created) => {
      vnet = created
    })
  })

  after(() => {
    if (!vnet) return

    const deleteOpts: DeleteVirtualTestnetsOptions = {
      vnet_ids: [vnet.id],
    }

    cy.task('deleteVirtualTestnets', deleteOpts)
  })

  return () => vnet
}
