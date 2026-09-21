import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { PoolPage } from '@/stellar/features/pool/PoolPage'
import { StellarUrls } from '@/stellar/routes/routes'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { checkDepositBalances, seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
import { fetchPoolState, type PoolState, TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { withdrawLpInput, withdrawSubmit } from '@cy/support/helpers/stellar/withdraw.helpers'
import { createComponentTestRouter } from '@cy/support/routes'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import { RouterProvider } from '@tanstack/react-router'

describe('Stellar testnet pool page', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: PoolState

  before(() => {
    getTestnetConfig()
      .then(config => {
        testnetConfig = config
        return connectTestWallet(config)
      })
      .then(API_LOAD_TIMEOUT, () => deployTestPool(testnetConfig))
      .then(LOAD_TIMEOUT, deployedPool => {
        pool = deployedPool
        return seedTestPool(pool, testnetConfig)
      })
  })

  beforeEach(() => {
    cy.then(LOAD_TIMEOUT, () => fetchPoolState(pool, testnetConfig)).then(freshState => (state = freshState))
  })

  it('loads a seeded live pool and switches between liquidity actions', () => {
    cy.mount(
      <StellarTestWrapper address={testnetConfig.deployer.address}>
        <RouterProvider
          router={createComponentTestRouter({
            component: PoolPage,
            path: 'dex/$network/pools/$pool',
            initialEntry: StellarUrls.pool({ network: TEST_NETWORK, pool }),
          })}
        />
      </StellarTestWrapper>,
    )

    state.coins.forEach(({ address }) => {
      cy.get(`[data-testid="pool-token-input-${address}"]`, LOAD_TIMEOUT).should('be.visible')
    })
    checkDepositBalances(state)

    cy.get('[data-testid="tab-withdraw"]', LOAD_TIMEOUT).click()
    withdrawLpInput().find('input').should('be.enabled')
    withdrawSubmit().should('be.disabled')
  })
})
