import { oneBool } from '@cy/support/generators'
import { API_LOAD_TIMEOUT, e2eBaseUrl, LOAD_TIMEOUT } from '@cy/support/ui'
import type { ErrorContext } from '@ui-kit/features/report-error'
import { SENTRY_DSN } from '@ui-kit/features/sentry'

const invalidIconAddress = '0x0000000000000000000000000000000000000001' as const
const borrowedTokenAddress = '0x0000000000000000000000000000000000000002' as const
const marketAddress = '0x0000000000000000000000000000000000000003' as const

const visitErrorBoundary = () => {
  cy.intercept(`https://prices.curve.finance/v1/crvusd/markets`, {
    body: { chains: { ethereum: { count: 0, data: [] } } },
  })
  cy.intercept(`https://prices.curve.finance/v1/lending/markets`, {
    body: {
      chains: {
        ethereum: {
          count: 1,
          data: [
            // Keep the API response valid, then trigger the render error from the icon path below.
            {
              name: 'ETH-crvUSD',
              version: 1,
              controller: marketAddress,
              vault: marketAddress,
              llamma: marketAddress,
              policy: marketAddress,
              oracle: marketAddress,
              oracle_pools: [],
              rate: 0,
              borrow_apy: 0,
              borrow_total_apy: 0,
              borrow_apr: 0,
              borrow_total_apr: 0,
              lend_apy: 0,
              lend_apr: 0,
              lend_apr_crv_0_boost: 0,
              lend_apr_crv_max_boost: 0,
              n_loans: 0,
              price_oracle: 1,
              amm_price: 1,
              base_price: 1,
              total_debt: 0,
              total_assets: 0,
              total_debt_usd: 0,
              total_assets_usd: 0,
              minted: 0,
              redeemed: 0,
              minted_usd: 0,
              redeemed_usd: 0,
              loan_discount: 0,
              liquidation_discount: 0,
              min_band: 0,
              max_band: 0,
              collateral_balance: 0,
              borrowed_balance: 0,
              collateral_balance_usd: 0,
              borrowed_balance_usd: 0,
              collateral_token: {
                symbol: 'ETH',
                address: invalidIconAddress,
                rebasing_yield: null,
                rebasing_yield_apr: null,
              },
              borrowed_token: {
                symbol: 'crvUSD',
                address: borrowedTokenAddress,
                rebasing_yield: null,
                rebasing_yield_apr: null,
              },
              leverage: 0,
              extra_reward_apr: [],
              created_at: '2023-01-01T00:00:00Z',
              max_ltv: 0,
            },
          ],
        },
      },
    },
  }).as('error')
  const url = '/llamalend/ethereum/markets'
  cy.visit(url, {
    timeout: API_LOAD_TIMEOUT.timeout,
    onBeforeLoad: ({ String }) => {
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

    cy.get('[data-testid="submit-error-report-button"]', LOAD_TIMEOUT).click()
    cy.get('[data-testid="submit-error-report-modal"]').should('be.visible')
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
})
