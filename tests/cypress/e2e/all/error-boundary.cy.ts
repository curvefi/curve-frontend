import { oneBool } from '@cy/support/generators'
import { createLendingVaultChainsResponse } from '@cy/support/helpers/lending-mocks'
import { setupLlamalendListMocks } from '@cy/support/helpers/llamalend/market-list-mocks'
import { API_LOAD_TIMEOUT, e2eBaseUrl, LOAD_TIMEOUT } from '@cy/support/ui'
import type { ErrorContext } from '@ui-kit/features/report-error'
import { SENTRY_DSN } from '@ui-kit/features/sentry'

const invalidIconAddress = '0x0000000000000000000000000000000000000001' as const

const visitErrorBoundary = () => {
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
    onBeforeLoad: ({ String, TypeError }) => {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
      const originalToLowerCase = String.prototype.toLowerCase
      String.prototype.toLowerCase = function (this: string) {
        if (this.toString() === invalidIconAddress) {
          throw new TypeError('toLowerCase is not a function')
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
  const { message: actualMessage, name: actualName, stack } = JSON.parse(error)
  expect(actualName).to.equal(expectedName)
  expect(actualMessage).to.contain(expectedMessage)
  if (Cypress.isBrowser('firefox')) {
    // Firefox stack frames use source names in dev, but only bundled TokenIcon chunk names in preview/CI builds.
    expect(stack).to.match(/TokenIcon(?:\.tsx|-.*\.js)/)
  } else {
    expect(stack).to.contain(expectedName)
    expect(stack).to.contain(expectedMessage)
  }
}

describe('Error Boundary', () => {
  let restoreRemoveChild: (() => void) | undefined
  afterEach(() => cy.then(() => restoreRemoveChild?.()))

  // note: this must be the first in the file, as firefox might cache responses from other tests
  it('should show error page when it hits the error boundary', () => {
    visitErrorBoundary()
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Unexpected Error')
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'toLowerCase is not a function')
    cy.get('[data-testid="retry-error-button"]').click()
    cy.wait('@error', LOAD_TIMEOUT) // API called again
  })

  const is500 = oneBool() // test either 404 or 500 error page
  it(`should submit ${is500 ? 500 : 404} error reports`, () => {
    const url = is500 ? visitErrorBoundary() : visitNotFoundPage()
    const address = '0xabc123'
    const description = 'Got an error'
    const contact = 'test@curve.fi'
    // Sentry sends envelope format: newline-delimited JSON with body in extra.body
    const { origin, pathname } = new URL(SENTRY_DSN)
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
    cy.intercept('POST', `${origin}/api/${pathname}/envelope/?**`, ({ body: envelope, reply }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      const lines = envelope.split('\n').filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      const event = JSON.parse(lines[2]) // event payload is the third line
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      const body = event.extra.body
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
      expect(Object.keys(body)).to.have.members(['formData', 'url', 'context'])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      expect(body.formData).to.deep.equal({ address, contactMethod: 'email', contact, description })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      expect(body.url).to.equal(url)
      if (is500) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
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
    let throwCount = 0
    const url = '/llamalend/ethereum/markets'
    cy.visit(url, {
      timeout: API_LOAD_TIMEOUT.timeout,
      onBeforeLoad: ({ DOMException, Node }) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
        const originalRemoveChild = Node.prototype.removeChild
        restoreRemoveChild = () => (Node.prototype.removeChild = originalRemoveChild)
        Node.prototype.removeChild = function <T extends Node>(child: T): T {
          // Throw twice to make this deterministic in concurrent mode: once is recovered, always causes an infinite loop
          if (throwCount < 2) {
            throwCount += 1
            throw new DOMException(
              "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
              'NotFoundError',
            )
          }
          return originalRemoveChild.call(this, child) as T
        }
      },
    })
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Unexpected Error')
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'Please refresh the page and try again.')
  })

  it('should open error report when app crashes before WagmiProvider', () => {
    cy.visit('/dex/bad-chain', {
      onLoad: win => {
        const warn = win.console.warn
        win.console.warn = (...args) => {
          // throw when `useOnChainUnavailable` tries to redirect the user due to the bad chain name in the URL
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          if (args[0].includes('Redirecting from')) throw new Error('Simulating error')
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
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
