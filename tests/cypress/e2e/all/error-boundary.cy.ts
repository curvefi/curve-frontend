import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'

const visitErrorBoundary = () => {
  cy.intercept(`https://prices.curve.finance/v1/crvusd/markets`, { body: { chains: { ethereum: { data: [] } } } })
  cy.intercept(`https://prices.curve.finance/v1/lending/markets`, {
    body: {
      chains: {
        ethereum: {
          data: [
            // make an error occur on purpose by returning nonsense data (`symbol` should be string)
            // note that the error only triggers the boundary if the query succeeds, but it fails during rendering
            {
              collateral_token: { symbol: 1 },
              borrowed_token: { symbol: 1 },
              extra_reward_apr: [],
              vault: '',
              controller: '',
              created_at: '2023-01-01T00:00:00Z',
            },
          ],
        },
      },
    },
  }).as('error')
  cy.visit('/llamalend/ethereum/markets', { timeout: API_LOAD_TIMEOUT.timeout })
  cy.wait('@error', LOAD_TIMEOUT)
}

describe('Error Boundary', () => {
  // note: this must be the first in the file, as firefox might cache responses from other tests
  it('should show error page when it hits the error boundary', () => {
    visitErrorBoundary()
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Unexpected Error')
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'toLowerCase is not a function')
    cy.window().then((win) => {
      win.console.log(win.localStorage)
      win.localStorage.clear() // empty react-query cache
      win.console.log(win.localStorage)
    })
    cy.get('[data-testid="retry-error-button"]').click()
    cy.wait('@error', LOAD_TIMEOUT) // API called again
  })

  it('should submit error report for a 500 page', () => {
    visitErrorBoundary()
    cy.intercept('POST', '**/api/error-report', (req) => {
      expect(req.body).to.include({
        address: '0xabc123',
        description: 'Clicked confirm and got an error',
      })
      expect(req.body).to.have.nested.property('context.error.message')
      req.reply({ statusCode: 200, body: { status: 'ok' } })
    }).as('errorReport')

    cy.get('[data-testid="submit-error-report-button"]').click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')

    cy.get('[data-testid="submit-error-report-address"]').clear()
    cy.get('[data-testid="submit-error-report-address"]').type('0xabc123')
    cy.get('[data-testid="submit-error-report-description"]').type('Clicked confirm and got an error')
    cy.get('[data-testid="submit-error-report-submit"]').click()

    cy.wait('@errorReport', LOAD_TIMEOUT)
  })

  it('should submit error report for a 404 page with url', () => {
    cy.intercept('POST', '**/api/error-report', (req) => {
      expect(req.body).to.have.nested.property('context.error.statusCode', 404)
      expect(req.body).to.have.nested.property('context.error.url')
      expect(req.body.context.error.url).to.include('/this-page-does-not-exist')
      req.reply({ statusCode: 200, body: { status: 'ok' } })
    }).as('errorReport')

    cy.visit('/this-page-does-not-exist', { timeout: API_LOAD_TIMEOUT.timeout })
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', '404')
    cy.get('[data-testid="submit-error-report-button"]').click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
    cy.get('[data-testid="submit-error-report-description"]').type('Not found')
    cy.get('[data-testid="submit-error-report-submit"]').click()
    cy.wait('@errorReport', LOAD_TIMEOUT)
  })
})
