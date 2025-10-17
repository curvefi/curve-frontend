import { PegKeeper } from '@/loan/components/PagePegKeepers/components/PegKeeper'
import { PEG_KEEPERS } from '@/loan/components/PagePegKeepers/constants'
import { ComponentTestWrapper, type Config } from '@cy/support/helpers/ComponentTestWrapper'
import { createTestWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'

const getVirtualNetwork = createVirtualTestnet((uuid) => ({
  slug: `pegkeepers-${uuid}`,
  display_name: `Pegkeepers (${uuid})`,
  fork_config: {
    block_number: '23039344',
  },
}))

const TestComponent = ({ config }: { config: Config }) => (
  <ComponentTestWrapper config={config} autoConnect={false}>
    <PegKeeper {...PEG_KEEPERS[0]} sx={{ maxWidth: '30rem' }} testId="pegkeeper" />
  </ComponentTestWrapper>
)

describe('Peg stability reserve', () => {
  it(`should work for blocknumber 23039344`, () => {
    const vnet = getVirtualNetwork()
    if (!vnet) {
      cy.log('Could not create virtual testnet')
      return
    }

    const config = createTestWagmiConfigFromVNet({ vnet })
    cy.mount(<TestComponent config={config} />)

    // Initial data when not connected
    cy.get('[data-testid="pegkeeper-metric-rate-value"]').invoke('text').should('eq', '0.99985')
    cy.get('[data-testid="pegkeeper-metric-debt-value"]')
      .as('debt')
      .invoke('text')
      .should('match', /11.48McrvUSD/i)
    cy.get('[data-testid="pegkeeper-metric-ceiling-value"]')
      .invoke('text')
      .should('match', /45MUSDC/i)

    cy.get('[data-testid="pegkeeper-action-info-pool-value"]').invoke('text').should('eq', '0x4D...9E')
    cy.get('[data-testid="pegkeeper-action-info-contract-value"]').invoke('text').should('eq', '0x92...40')
    cy.get('[data-testid="pegkeeper-action-info-profit-value"]').as('est-profit').invoke('text').should('eq', '3.31562')

    cy.get('[data-testid="navigation-connect-wallet"]').as('connect-wallet').should('exist')

    // Connect wallet
    cy.get('@connect-wallet').click()
    cy.get('@connect-wallet').should('not.exist')

    // Connected, simulate actual profit and show rebalance button
    cy.get('[data-testid="pegkeeper-rebalance-button"]')
      .as('rebalance-button')
      .invoke('text')
      .should('match', /rebalance/i)

    cy.get('@est-profit').invoke('text').should('eq', '4.64834')

    // Rebalance
    cy.get('@rebalance-button')
      .should('exist')
      .invoke('text')
      .should('match', /rebalance/i)

    cy.get('@rebalance-button')
      .click()
      .should('be.disabled')
      .invoke('text')
      .should('match', /rebalancing\.\.\./i)

    // Final updated state
    cy.get('@est-profit').invoke('text').should('eq', '0')
    cy.get('@debt')
      .invoke('text')
      .should('match', /10.67McrvUSD/i)
    cy.get('@rebalance-button')
      .should('be.disabled')
      .invoke('text')
      .should('match', /rebalance/i)
  })
})
