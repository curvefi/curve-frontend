import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'

describe('DEX Swap', () => {
  const FROM_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  const TO_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  const ExpectedExchangeRate = /1 ETH = \d+(?:\.\d{2,4})?k USDT/

  it('shows quotes via router API when disconnected', () => {
    cy.visitWithoutTestConnector(`dex/ethereum/swap?from=${FROM_USDT}&to=${TO_ETH}`)
    cy.get('[data-testid="btn-connect-wallet"]', TIMEOUTS['ui.render']).should('be.enabled')
    cy.get(`[data-testid="token-icon-${FROM_USDT}"]`, TIMEOUTS['router.tokens']).should('be.visible')

    cy.get('[data-testid="from-amount"] [name="fromAmount"]').as('from')
    cy.get('[data-testid="to-amount"] [name="toAmount"]').as('to')
    cy.get('@from').should('be.enabled')
    cy.get('@from').type('1234')
    cy.get('@to').click()

    cy.get('@to', TIMEOUTS['router.routes']).should('not.contain', '0.0')
    getActionValue('exchange-rate', 'router.routes').should('match', ExpectedExchangeRate)
    cy.get(`[data-testid="price-impact-value"]`).contains('%', TIMEOUTS['router.routes'])

    cy.get('@to').type('4321')
    cy.get('@from').click()

    cy.get('@from', TIMEOUTS['router.routes']).should('not.contain', '1234')
    getActionValue('exchange-rate', 'router.routes').should('match', ExpectedExchangeRate)
    cy.get(`[data-testid="price-impact-value"]`).contains('%', TIMEOUTS['router.routes'])
  })
})
