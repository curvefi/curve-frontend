import { REFUEL_API_ALIASES, REFUEL_POOL_ADDRESS, setupRefuelMocks } from '@cy/support/helpers/refuel-mocks'
import type { AppRoute } from '@cy/support/routes'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'

const REFUEL_ROUTE = `dex/ethereum/pools/${REFUEL_POOL_ADDRESS}/manage-pool` satisfies AppRoute

/** Smol helper to reduce amount of repetition */
const getTestById = (testId: string, options?: Partial<Cypress.Timeoutable>) =>
  cy.get(`[data-testid="refuel-${testId}"]`, options)

const expectNumericMetric = (testId: string) =>
  getTestById(testId, API_LOAD_TIMEOUT).should($element => {
    expect($element.attr('data-value')).to.match(/\d/)
  })

describe('Refuel page', () => {
  beforeEach(setupRefuelMocks)

  const visitRefuelPage = () => {
    cy.visitWithoutTestConnector(REFUEL_ROUTE)
    cy.location('pathname', LOAD_TIMEOUT).should('equal', `/${REFUEL_ROUTE}`)
    cy.wait(
      Object.values(REFUEL_API_ALIASES).map((alias): `@${string}` => `@${alias}`),
      API_LOAD_TIMEOUT,
    )
    getTestById('page', LOAD_TIMEOUT).should('be.visible')
  }

  it('renders the crvUSD/WETH refuel dashboard and disconnected form state', () => {
    visitRefuelPage()

    cy.get('input[name="tokenAAmount"]').should('be.visible').and('have.attr', 'placeholder', '0.00')
    cy.get('input[name="tokenBAmount"]').should('be.visible').and('have.attr', 'placeholder', '0.00')

    getTestById('connect-wallet-button').should('be.visible').and('contain.text', 'Connect Wallet')
    getTestById('submit-button').should('not.exist')

    getTestById('size-action-info').should('contain.text', 'Percentage of pool TVL')
    getTestById('weekly-action-info').should('contain.text', 'Weekly')
    getTestById('bi-weekly-action-info').should('contain.text', 'Bi-weekly')
    getTestById('monthly-action-info').should('contain.text', 'Monthly')

    getTestById('size-action-info-value').should('have.attr', 'data-value', '-')
    getTestById('weekly-action-info-value').should('have.attr', 'data-value', '-')
    getTestById('bi-weekly-action-info-value').should('have.attr', 'data-value', '-')
    getTestById('monthly-action-info-value').should('have.attr', 'data-value', '-')

    getTestById('pool-information').should('be.visible')
    expectNumericMetric('pool-tvl-value')
    expectNumericMetric('pool-volume-value')
    expectNumericMetric('pool-fees-value')
    expectNumericMetric('pool-apr-value')

    getTestById('prices-chart').should('be.visible')
    expectNumericMetric('lp-token-value-value')
    expectNumericMetric('virtual-price-value')
    getTestById('prices-chart').contains('Last price').should('be.visible')
    getTestById('prices-chart').contains('Oracle price').should('be.visible')
    getTestById('prices-chart').contains('Price scale').should('be.visible')

    getTestById('budget-chart').should('be.visible')
    expectNumericMetric('shares-value')
    expectNumericMetric('duration-value')
    expectNumericMetric('max-ratio-value')
    getTestById('budget-chart').contains('Refuel shares').should('be.visible')
    getTestById('budget-chart').contains('Unlocked refuel shares').should('be.visible')

    getTestById('reserves-composition-chart').should('be.visible')
    getTestById('reserves-composition-chart').contains('crvUSD').should('be.visible')
    getTestById('reserves-composition-chart').contains('WETH').should('be.visible')

    getTestById('daily-refuels-chart').should('be.visible')
    getTestById('daily-refuels-chart').contains('Daily refuels').should('be.visible')
    getTestById('daily-refuels-chart').contains('Refuel count').should('be.visible')

    getTestById('recent-refuels').should('be.visible')
    getTestById('recent-refuels').find('[data-testid="data-table"]', API_LOAD_TIMEOUT).should('be.visible')
    getTestById('recent-refuels')
      .find('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT)
      .its('length')
      .should('be.greaterThan', 0)
  })
})
