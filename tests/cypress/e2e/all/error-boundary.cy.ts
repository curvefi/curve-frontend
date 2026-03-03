import { oneBool } from '@cy/support/generators'
import { interceptSentryReport } from '@cy/support/helpers/sentry.helpers'
import { API_LOAD_TIMEOUT, e2eBaseUrl, LOAD_TIMEOUT } from '@cy/support/ui'
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
  cy.visit(url, { timeout: API_LOAD_TIMEOUT.timeout })
  cy.wait('@error', LOAD_TIMEOUT)
  return e2eBaseUrl() + url
}

const visitNotFoundPage = () => {
  const url = '/llamalend/ethereum/markets/non-existent-market'
  cy.visit(url, { timeout: API_LOAD_TIMEOUT.timeout })
  return e2eBaseUrl() + url
}

function check500Error(context: unknown) {
  const [expectedName, expectedMessage] = ['TypeError', 'toLowerCase is not a function']
  expect(Object.keys(context as object)).to.have.members(['title', 'subtitle', 'error'])
  const { subtitle, error, title } = context as Record<keyof ErrorContext, string>
  expect(title).to.equal('Unexpected Error')
  expect(subtitle).to.contain(expectedMessage)
  const { message: actualMessage, name: actualName, stack } = JSON.parse(error)
  expect(actualName).to.equal(expectedName)
  expect(actualMessage).to.contain(expectedMessage)
  if (Cypress.isBrowser('firefox')) {
    expect(stack).to.match(/lodash/i)
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
    const visitUrl = is500 ? visitErrorBoundary() : visitNotFoundPage()
    const address = '0xabc123'
    const description = 'Got an error'
    const contact = 'test@curve.fi'
    const waitForSentryReport = interceptSentryReport((body: Record<string, unknown>) => {
      if (is500) {
        expect(Object.keys(body)).to.have.members(['formData', 'url', 'context'])
        const { formData, context, url: bodyUrl } = body
        expect(formData).to.deep.equal({ address, contactMethod: 'email', contact, description })
        expect(bodyUrl).to.equal(visitUrl)
        check500Error(context)
      } else {
        expect(body).to.deep.equal({
          formData: { address, contactMethod: 'email', contact, description },
          url: visitUrl,
          context: { title: '404', subtitle: 'Page Not Found' },
        })
      }
    })

    cy.get('[data-testid="submit-error-report-button"]', LOAD_TIMEOUT).click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
    cy.get('[data-testid="submit-error-report-address"]').clear()
    cy.get('[data-testid="submit-error-report-address"]').type(address)
    cy.get('[data-testid="submit-error-report-contact"]').type(contact)
    cy.get('[data-testid="submit-error-report-description"]').type(description)
    cy.get('[data-testid="submit-error-report-submit"]').click()

    waitForSentryReport()
    cy.get('[data-testid="submit-error-report-modal"]').should('not.exist')
  })
})
