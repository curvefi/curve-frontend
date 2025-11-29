import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Error Boundary', () => {
  // note: this must be the first in the file, as firefox might cache responses from other tests
  it('should show error page when it hits the error boundary', () => {
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
    cy.visit('/llamalend/ethereum/markets')
    cy.wait('@error', LOAD_TIMEOUT)
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
})
