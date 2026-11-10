import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'

/** Newly deployed test pools are not indexed by the backend yet. */
export const mockLitePool = (pool: StellarContract) => {
  const { chainId } = STELLAR_NETWORKS['stellar-testnet']
  return cy.intercept('GET', `**/get_pools/${chainId}`, {
    success: true,
    data: { pool_data: [{ id: pool, address: pool, chain_id: chainId, registry_id: 'test' }] },
    generated_time_ms: Date.now(),
  })
}
