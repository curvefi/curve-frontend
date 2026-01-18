import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'
import type { ErrorContext } from '@ui-kit/features/report-error'

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
  const url = '/llamalend/ethereum/markets'
  cy.visit(url, {
    timeout: API_LOAD_TIMEOUT.timeout,
    onBeforeLoad(win) {
      win.console.log(win.localStorage)
      win.localStorage.clear() // empty react-query cache
      win.console.log(win.localStorage)
    },
  })
  cy.wait('@error', LOAD_TIMEOUT)
  return Cypress.config('baseUrl') + url
}

const visitNotFoundPage = () => {
  const url = '/llamalend/ethereum/markets/non-existent-market'
  cy.visit(url, { timeout: API_LOAD_TIMEOUT.timeout })
  return Cypress.config('baseUrl') + url
}

function check500Error({ context }: { context: object }) {
  const [expectedName, expectedMessage] = ['TypeError', 'toLowerCase is not a function']
  expect(Object.keys(context)).to.have.members(['title', 'subtitle', 'error'])
  const { subtitle, error, title } = context as ErrorContext
  expect(title).to.equal('Unexpected Error')
  expect(subtitle).to.contain(expectedMessage)
  const { message: actualMessage, name: actualName, stack } = error as Error
  expect(actualName).to.equal(expectedName)
  expect(actualMessage).to.contain(expectedMessage)
  if (Cypress.isBrowser('firefox')) {
    expect(stack).to.contain('getUniqueSortedStrings')
    expect(stack).to.contain('MultiSelectFilter')
  } else {
    expect(stack).to.contain(expectedName)
    expect(stack).to.contain(expectedMessage)
  }
}

describe('Error Boundary', () => {
  // note: this must be the first in the file, as firefox might cache responses from other tests
  it('should show error page when it hits the error boundary', () => {
    visitErrorBoundary()
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Unexpected Error')
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'toLowerCase is not a function')
    cy.get('[data-testid="retry-error-button"]').click()
    cy.wait('@error', LOAD_TIMEOUT) // API called again
  })

  it('should submit error report', () => {
    const is500 = true // oneBool() // test either 404 or 500 error page
    const url = is500 ? visitErrorBoundary() : visitNotFoundPage()
    const address = '0xabc123'
    const description = 'Got an error'
    const contact = 'test@curve.fi'
    cy.intercept('POST', '**/api/error-report', ({ body: { body }, reply }) => {
      const bodyJson = JSON.parse(body)
      expect(Object.keys(bodyJson)).to.have.members(['formData', 'url', 'context'])
      expect(bodyJson.formData).to.deep.equal({ address, contactMethod: 'email', contact, description })
      expect(bodyJson.url).to.equal(url)
      if (is500) {
        check500Error(bodyJson)
      } else {
        expect(bodyJson).to.deep.equal({
          formData: { address, contactMethod: 'email', contact, description },
          url,
          context: { title: '404', subtitle: 'Page Not Found' },
        })
      }
      reply({ statusCode: 200, body: { status: 'ok' } })
    }).as('errorReport')

    cy.get('[data-testid="submit-error-report-button"]').click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
    cy.get('[data-testid="submit-error-report-address"]').clear()
    cy.get('[data-testid="submit-error-report-address"]').type(address)
    cy.get('[data-testid="submit-error-report-contact"]').type(contact)
    cy.get('[data-testid="submit-error-report-description"]').type(description)
    cy.get('[data-testid="submit-error-report-submit"]').click()

    cy.wait('@errorReport', LOAD_TIMEOUT)
  })
})
