import type { AppRoute } from '@cy/support/routes'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'

const REFUEL_POOL_ADDRESS = '0x6e5492f8ea2370844ee098a56dd88e1717e4a9c2'
const REFUEL_ROUTE = `dex/ethereum/pools/${REFUEL_POOL_ADDRESS}/refuel` satisfies AppRoute

/** Smol helper to reduce amount of repetition */
const getTestId = (testId: string, options?: Partial<Cypress.Timeoutable>) =>
  cy.get(`[data-testid="refuel-${testId}"]`, options)

describe('Refuel page', () => {
  const visitRefuelPage = () => {
    cy.visitWithoutTestConnector(REFUEL_ROUTE)
    cy.location('pathname', LOAD_TIMEOUT).should('equal', `/${REFUEL_ROUTE}`)
    getTestId('page', LOAD_TIMEOUT).should('be.visible')
  }

  it('renders the crvUSD/WETH refuel dashboard and disconnected form state', () => {
    visitRefuelPage()

    cy.contains('Refuel setup').should('be.visible')

    cy.get('input[name="tokenAAmount"]').should('be.visible').and('have.attr', 'placeholder', '0.00')
    cy.get('input[name="tokenBAmount"]').should('be.visible').and('have.attr', 'placeholder', '0.00')

    cy.contains('crvUSD', API_LOAD_TIMEOUT).should('be.visible')
    cy.contains('WETH', API_LOAD_TIMEOUT).should('be.visible')

    getTestId('connect-wallet-button').should('be.visible').and('contain.text', 'Connect Wallet')
    getTestId('submit-button').should('not.exist')

    getTestId('size-action-info').should('contain.text', 'Percentage of pool TVL')
    getTestId('weekly-action-info').should('contain.text', 'Weekly')
    getTestId('bi-weekly-action-info').should('contain.text', 'Bi-weekly')
    getTestId('monthly-action-info').should('contain.text', 'Monthly')

    getTestId('size-action-info-value').should('have.attr', 'data-value', '-')
    getTestId('weekly-action-info-value').should('have.attr', 'data-value', '-')
    getTestId('bi-weekly-action-info-value').should('have.attr', 'data-value', '-')
    getTestId('monthly-action-info-value').should('have.attr', 'data-value', '-')

    getTestId('pool-information', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('pool-tvl-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('pool-volume-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('pool-fees-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('pool-apr-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)

    getTestId('prices-chart', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('lp-token-value-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('virtual-price-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('prices-chart').contains('Last price').should('be.visible')
    getTestId('prices-chart').contains('Oracle price').should('be.visible')
    getTestId('prices-chart').contains('Price scale').should('be.visible')

    getTestId('budget-chart', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('shares-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('duration-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('max-ratio-value', API_LOAD_TIMEOUT).invoke('attr', 'data-value').should('match', /\d/)
    getTestId('budget-chart').contains('Refuel shares').should('be.visible')
    getTestId('budget-chart').contains('Unlocked refuel shares').should('be.visible')

    getTestId('reserves-composition-chart', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('reserves-composition-chart').contains('crvUSD').should('be.visible')
    getTestId('reserves-composition-chart').contains('WETH').should('be.visible')

    getTestId('daily-refuels-chart', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('daily-refuels-chart').contains('Daily refuels').should('be.visible')
    getTestId('daily-refuels-chart').contains('Refuel count').should('be.visible')

    getTestId('recent-refuels', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('recent-refuels').find('[data-testid="data-table"]', API_LOAD_TIMEOUT).should('be.visible')
    getTestId('recent-refuels')
      .find('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT)
      .its('length')
      .should('be.greaterThan', 0)
  })
})
