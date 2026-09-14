import type { StellarAddress, StellarContract, StellarSecret } from '@/stellar/features/connect-wallet/address'
import type { StellarNetwork } from '@/stellar/lib/networks'
import { assert } from '@primitives/objects.utils'

export type TokenConfig = { symbol: string; address: StellarContract; decimals: number }

export type TestnetConfig = {
  network: StellarNetwork
  deployer: { address: StellarAddress; secret: StellarSecret }
  issuer: StellarAddress
  factory: StellarContract
  coins: TokenConfig[]
  pool: StellarContract
}

/** Set STELLAR_TESTNET_CONFIG in tests/cypress.env.json, or CYPRESS_STELLAR_TESTNET_CONFIG as JSON in the shell. */
export const getTestnetConfig = () =>
  cy
    .env<{ STELLAR_TESTNET_CONFIG?: TestnetConfig }>(['STELLAR_TESTNET_CONFIG'], { log: false })
    .then(({ STELLAR_TESTNET_CONFIG }) =>
      assert(STELLAR_TESTNET_CONFIG, 'STELLAR_TESTNET_CONFIG environment variable is not set'),
    )
