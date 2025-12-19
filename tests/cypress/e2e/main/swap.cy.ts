import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'

describe('DEX Swap', () => {
  const FROM_USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const TO_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

  it('shows quotes via router API when disconnected', () => {
    cy.visitWithoutTestConnector(`dex/ethereum/swap?from=${FROM_USDT}&to=${TO_ETH}`)
    cy.get('[data-testid="btn-connect-wallet"]', LOAD_TIMEOUT).should('be.enabled')
    cy.get(`[data-testid="token-icon-${FROM_USDT}"]`, API_LOAD_TIMEOUT).should('be.visible')

    cy.get('[data-testid="from-amount"] [name="fromAmount"]').as('from')
    cy.get('[data-testid="to-amount"] [name="toAmount"]').as('to')
    cy.get('@from').should('be.enabled')
    cy.get('@from').type('1234')
    cy.get('@to').click()

    cy.get('@to', LOAD_TIMEOUT).should('not.contain', '0.0')
    cy.get(`[data-testid="exchange-rate-value"]`).contains('/', LOAD_TIMEOUT)
    cy.get(`[data-testid="price-impact-value"]`).contains('%', LOAD_TIMEOUT)

    cy.get('@to').type('4321')
    cy.get('@from').click()

    cy.get('@from', LOAD_TIMEOUT).should('not.contain', '1234')
    cy.get(`[data-testid="exchange-rate-value"]`).contains('/', LOAD_TIMEOUT)
    cy.get(`[data-testid="price-impact-value"]`).contains('%', LOAD_TIMEOUT)
  })
})
