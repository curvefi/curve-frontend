import { CyHttpMessages } from 'cypress/types/net-stubbing'
import { oneBool } from '@cy/support/generators'
import { createLendingVaultChainsResponse } from '@cy/support/helpers/lending-mocks'
import { setupLlamalendListMocks } from '@cy/support/helpers/llamalend/market-list-mocks'
import { API_LOAD_TIMEOUT, e2eBaseUrl, LOAD_TIMEOUT } from '@cy/support/ui'
import type { ErrorContext, ErrorReportFormValues } from '@ui-kit/features/report-error'
import { SENTRY_DSN } from '@ui-kit/features/sentry'

const invalidIconAddress = '0x0000000000000000000000000000000000000001' as const
const domMutationErrorMessage =
  "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."

const visitErrorBoundary = (errorFactory: (win: Cypress.AUTWindow) => Error) => {
  const { ethereum, ...otherChains } = createLendingVaultChainsResponse()
  setupLlamalendListMocks({
    ethereum: {
      ...ethereum,
      data: ethereum.data.map(market => ({
        ...market,
        // Keep the API response valid, then trigger the render error from the icon path below.
        collateral_token: { ...market.collateral_token, address: invalidIconAddress },
      })),
    },
    ...otherChains,
  }).lendingVaults.as('error')
  const url = '/llamalend/ethereum/markets'
  cy.visit(url, {
    timeout: API_LOAD_TIMEOUT.timeout,
    onBeforeLoad: win => {
      const { String } = win
      // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
      const originalToLowerCase = String.prototype.toLowerCase
      String.prototype.toLowerCase = function (this: string) {
        if (this.toString() === invalidIconAddress) {
          throw errorFactory(win)
        }
        return originalToLowerCase.call(this)
      }
    },
  })
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
  const errorData = JSON.parse(error) as { message: string; name: string; stack: string }
  const { message: actualMessage, name: actualName, stack } = errorData
  expect(actualName).to.equal(expectedName)
  expect(actualMessage).to.contain(expectedMessage)
  if (Cypress.isBrowser('firefox')) {
    // Firefox stack frames use source names in dev but only bundled TokenIcon chunk names in preview/CI builds.
    expect(stack).to.match(/TokenIcon(?:\.tsx|-.*\.js)/)
  } else {
    expect(stack).to.contain(expectedName)
    expect(stack).to.contain(expectedMessage)
  }
}

type ErrorReportBody = {
  formData: ErrorReportFormValues
  url: string
  context: { title: string; subtitle: string }
}

describe('Error Boundary', () => {
  // note: this must be the first in the file, as firefox might cache responses from other tests
  it('should show error page when it hits the error boundary', () => {
    visitErrorBoundary(({ TypeError }) => new TypeError('toLowerCase is not a function'))
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Unexpected Error')
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'toLowerCase is not a function')
    cy.get('[data-testid="retry-error-button"]').click()
    cy.wait('@error', LOAD_TIMEOUT) // API called again
  })

  const is500 = oneBool() // test either 404 or 500 error page
  it(`should submit ${is500 ? 500 : 404} error reports`, () => {
    const url = is500
      ? visitErrorBoundary(({ TypeError }) => new TypeError('toLowerCase is not a function'))
      : visitNotFoundPage()
    const address = '0xabc123'
    const description = 'Got an error'
    const contact = 'test@curve.fi'
    // Sentry sends envelope format: newline-delimited JSON with body in extra.body
    const { origin, pathname } = new URL(SENTRY_DSN)
    cy.intercept(
      'POST',
      `${origin}/api/${pathname}/envelope/?**`,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ({ body: envelope, reply }: CyHttpMessages.IncomingHttpRequest<string, unknown>) => {
        const lines = envelope.split('\n').filter(Boolean)
        const event = JSON.parse(lines[2]) as { extra: { body: ErrorReportBody } } // event payload is the third line

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
      },
    ).as('sentryReport')

    cy.get('[data-testid="submit-error-report-button"]', LOAD_TIMEOUT).click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
    cy.get('[data-testid="submit-error-report-address"]')
      .invoke('val')
      .should('match', /^0x[a-fA-F0-9]{40}$/)
    cy.get('[data-testid="submit-error-report-address"]').clear()
    cy.get('[data-testid="submit-error-report-address"]').type(address)
    cy.get('[data-testid="submit-error-report-contact"]').type(contact)
    cy.get('[data-testid="submit-error-report-description"]').type(description)
    cy.get('[data-testid="submit-error-report-submit"]').click()

    cy.wait('@sentryReport', LOAD_TIMEOUT)
    cy.get('[data-testid="submit-error-report-modal"]').should('not.exist')
  })

  it('should show some guidance when a DOM mutation error occurs', () => {
    visitErrorBoundary(({ DOMException }) => new DOMException(domMutationErrorMessage, 'NotFoundError'))
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Unexpected Error')
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'Please refresh the page and try again.')
  })

  it('should open error report when app crashes before WagmiProvider', () => {
    cy.visit('/dex/bad-chain', {
      onLoad: win => {
        const warn = win.console.warn
        win.console.warn = (...args: string[]) => {
          // throw when `useOnChainUnavailable` tries to redirect the user due to the bad chain name in the URL
          if (args[0].includes('Redirecting from')) throw new Error('Simulating error')
          return warn(...args)
        }
      },
    })

    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Layout error')
    cy.get('[data-testid="submit-error-report-button"]').click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
    cy.get('[data-testid="submit-error-report-address"]').should('have.value', '')
  })
})
