import { oneBool } from '@cy/support/generators'
import { API_LOAD_TIMEOUT, e2eBaseUrl, LOAD_TIMEOUT } from '@cy/support/ui'
import type { ErrorContext } from '@ui-kit/features/report-error'
import { SENTRY_DSN } from '@ui-kit/features/sentry'

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
  cy.visit(url, { timeout: API_LOAD_TIMEOUT.timeout })
  cy.wait('@error', LOAD_TIMEOUT)
  return e2eBaseUrl() + url
}

const visitNotFoundPage = () => {
  const url = '/llamalend/ethereum/markets/non-existent-market'
  cy.visit(url, { timeout: API_LOAD_TIMEOUT.timeout })
  return e2eBaseUrl() + url
}

function check500Error({ context }: { context: object }) {
  const [expectedName, expectedMessage] = ['TypeError', 'toLowerCase is not a function']
  expect(Object.keys(context)).to.have.members(['title', 'subtitle', 'error'])
  const { subtitle, error, title } = context as Record<keyof ErrorContext, string>
  expect(title).to.equal('Unexpected Error')
  expect(subtitle).to.contain(expectedMessage)
  const { message: actualMessage, name: actualName, stack } = JSON.parse(error)
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

  const is500 = oneBool() // test either 404 or 500 error page
  it('should submit error report for ' + (is500 ? 500 : 404), () => {
    const url = is500 ? visitErrorBoundary() : visitNotFoundPage()
    const address = '0xabc123'
    const description = 'Got an error'
    const contact = 'test@curve.fi'
    // Sentry sends envelope format: newline-delimited JSON with body in extra.body
    const { origin, pathname } = new URL(SENTRY_DSN)
    cy.intercept('POST', `${origin}/api/${pathname}/envelope/?**`, ({ body: envelope, reply }) => {
      const lines = envelope.split('\n').filter(Boolean)
      const event = JSON.parse(lines[2]) // event payload is the third line
      const body = event.extra.body
      expect(Object.keys(body)).to.have.members(['formData', 'url', 'context'])
      expect(body.formData).to.deep.equal({ address, contactMethod: 'email', contact, description })
      expect(body.url).to.equal(url)
      if (is500) {
        check500Error(body)
      } else {
        expect(body).to.deep.equal({
          formData: { address, contactMethod: 'email', contact, description },
          url,
          context: { title: '404', subtitle: 'Page Not Found' },
        })
      }

      reply({
        statusCode: 200,
        body: {},
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-credentials': 'true',
        },
      })
    }).as('sentryReport')

    cy.get('[data-testid="submit-error-report-button"]').click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
    cy.get('[data-testid="submit-error-report-address"]').clear()
    cy.get('[data-testid="submit-error-report-address"]').type(address)
    cy.get('[data-testid="submit-error-report-contact"]').type(contact)
    cy.get('[data-testid="submit-error-report-description"]').type(description)
    cy.get('[data-testid="submit-error-report-submit"]').click()

    cy.wait('@sentryReport', LOAD_TIMEOUT)
    cy.get('[data-testid="submit-error-report-modal"]').should('not.exist')
  })
})
