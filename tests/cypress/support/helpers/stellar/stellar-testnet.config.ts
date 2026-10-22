import type { StellarAddress, StellarContract, StellarSecret } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { TIMEOUTS } from '@cy/support/timeout-categories'

export type TestnetAccount = { address: StellarAddress; secret: StellarSecret }

/** Runtime fixtures: a generated deployer and the existing deployment's contracts. */
export type TestnetConfig = {
  deployer: TestnetAccount
  issuer: { address: StellarAddress }
  factory: StellarContract
  coins: StellarContract[]
}

/** Set STELLAR_TESTNET_CONFIG in tests/cypress.env.json, or CYPRESS_STELLAR_TESTNET_CONFIG as JSON in the shell. */
export const getTestnetConfig = () =>
  cy.task<TestnetConfig>('getStellarTestnetConfig', STELLAR_NETWORKS['stellar-testnet'].rpcUrl, {
    ...TIMEOUTS['stellar.fundWallet'],
    log: false,
  })
