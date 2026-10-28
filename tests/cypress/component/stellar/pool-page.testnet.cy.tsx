import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { PoolPage } from '@/stellar/features/pool/PoolPage'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { StellarUrls } from '@/stellar/routes/routes'
import { mockPoolCampaigns } from '@cy/support/helpers/campaign-mocks'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { checkDepositBalances, seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
import { fetchPoolState, poolInput, type PoolState, TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { withdrawLpInput, withdrawSubmit } from '@cy/support/helpers/stellar/withdraw.helpers'
import { createComponentTestRouter } from '@cy/support/routes'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { oneViewport, skipTestsAfterFailure } from '@cy/support/ui'
import { RouterProvider } from '@tanstack/react-router'
import { getCampaignsPoolsMerklQueryKey } from '@ui/features/campaigns/campaigns-pools-merkl.query'
import { queryClient } from '@ui/features/queries/query-client'

describe('Stellar testnet pool page', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: PoolState
  const [width, height, breakpoint] = oneViewport()

  const mountPoolPage = () => {
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
    cy.viewport(width, height)
  }

  before(() => {
    getTestnetConfig()
      .then(async config => {
        testnetConfig = config
        await connectTestWallet(config)
      })
      .then(TIMEOUTS['stellar.deployPool'], () => deployTestPool(testnetConfig))
      .then(TIMEOUTS['stellar.seedPool'], async deployedPool => {
        pool = deployedPool
        await seedTestPool(pool, testnetConfig)
      })
  })

  beforeEach(() =>
    cy
      .then(TIMEOUTS['stellar.read'], () => fetchPoolState(pool, testnetConfig))
      .then(freshState => (state = freshState)),
  )

  it('loads a seeded live pool and switches between liquidity actions', () => {
    mountPoolPage()

    state.coins.forEach(({ address }) => {
      cy.get(`[data-testid="pool-token-input-${address}"]`, TIMEOUTS['ui.render']).should('be.visible')
    })
    checkDepositBalances(state)

    cy.get('[data-testid="tab-withdraw"]', TIMEOUTS['ui.interaction']).click()
    cy.get('[data-testid="tab-withdraw-one-coin"]').should('have.attr', 'aria-selected', 'true')
    poolInput(state.coins[0].address).find('input', TIMEOUTS['stellar.read']).should('be.enabled')
    cy.get('[data-testid="pool-withdraw-lp-input"]').should('not.exist')
    withdrawSubmit().should('be.disabled')

    cy.get('[data-testid="tab-withdraw-advanced"]').click()
    cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').should('not.be.checked')
    withdrawLpInput().find('input', TIMEOUTS['stellar.read']).should('be.enabled')
    state.coins.map(({ address }) => poolInput(address).should('be.visible'))
    cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').check()
    cy.get('[data-testid="pool-withdraw-lp-input"]').should('not.exist')
    withdrawSubmit().should('be.disabled')
  })

  it('shows pool campaigns with APR, points, and issuer links for the current network', () => {
    queryClient.removeQueries({ queryKey: [getCampaignsPoolsMerklQueryKey({})] })
    mockPoolCampaigns({ address: pool, name: 'Stellar test pool' }, state.coins[0].address, [
      { apr: 7, symbol: 'RWD', network: TEST_NETWORK, chainId: STELLAR_NETWORKS[TEST_NETWORK].chainId },
      { apr: 0, symbol: 'PTS', network: TEST_NETWORK, chainId: STELLAR_NETWORKS[TEST_NETWORK].chainId },
      { apr: 99, symbol: 'MAINNET', network: 'stellar', chainId: STELLAR_NETWORKS.stellar.chainId },
    ])
    mountPoolPage()

    cy.wait('@campaigns')
    cy.get('[data-testid="data-table-cell-rate"]').should('have.length', 1).and('contain.text', '7%')
    cy.get('[data-testid="data-table-cell-multiplier"]').should('contain.text', 'PTS')
    cy.get('[data-testid="data-table-cell-campaignUrl"]')
      .find('a')
      .should('have.attr', 'href', `https://app.merkl.xyz/opportunities/${TEST_NETWORK}/POOL/${pool}-PTS`)
    cy.get('[data-testid="yield-rate-tooltip-trigger"]').trigger(breakpoint === 'mobile' ? 'touchstart' : 'mouseover', {
      touches: [{ pageX: width / 2, clientY: height / 2 }],
    })
    cy.get('[data-testid="tooltip-value-link"]')
      .should('be.visible')
      .and('have.attr', 'href', `https://app.merkl.xyz/opportunities/${TEST_NETWORK}/POOL/${pool}-RWD`)
  })
})
