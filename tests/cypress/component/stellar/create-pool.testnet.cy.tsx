import { CreatePoolPage } from '@/stellar/features/create-pool/CreatePoolPage'
import { StellarPages } from '@/stellar/routes/routes'
import { oneOf } from '@cy/support/generators'
import { connectTestWallet } from '@cy/support/helpers/stellar/connector'
import { TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { createComponentTestRouter } from '@cy/support/routes'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { oneViewport } from '@cy/support/ui'
import { RouterProvider } from '@tanstack/react-router'

describe('Stellar testnet pool creation', () => {
  let testnetConfig: TestnetConfig
  const [width, height, breakpoint] = oneViewport()

  before(() =>
    getTestnetConfig().then(async config => {
      testnetConfig = config
      await connectTestWallet(config)
    }),
  )

  it('deploys a pool with the selected tokens', () => {
    const coins = testnetConfig.coins.slice(0, oneOf(2, 3))
    cy.viewport(width, height)
    cy.mount(
      <StellarTestWrapper address={testnetConfig.deployer.address}>
        <RouterProvider
          router={createComponentTestRouter({
            component: CreatePoolPage,
            path: 'dex/$network/create-pool',
            initialEntry: StellarPages.createPool({ network: TEST_NETWORK }),
          })}
        />
      </StellarTestWrapper>,
    )

    if (coins.length === 3) cy.get('[data-testid="create-pool-add-token"]').click()
    coins.forEach((address, index) => {
      cy.get('[data-testid="create-pool-token-select"]').eq(index).find('[role="combobox"]').click()
      cy.get('[data-testid="create-pool-token-search"] input').type(address)
      cy.get(`[data-testid="token-option-${address.toLowerCase()}"]`, TIMEOUTS['stellar.read']).click()
    })
    cy.get('[data-testid="create-pool-type-stableswap"]').click()
    if (breakpoint === 'mobile') cy.get('[data-testid="mobile-form-action-summary"]').click()
    cy.get('[data-testid="create-pool-submit"]').click(TIMEOUTS['stellar.simulation'])
    cy.get('[data-testid="create-pool-success"]', TIMEOUTS['stellar.confirmation']).should('be.visible')
  })
})
