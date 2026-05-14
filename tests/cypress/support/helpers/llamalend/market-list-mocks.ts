import { LendingChains } from '@cy/support/helpers/lending-mocks'
import { fromEntries } from '@primitives/objects.utils'

/**
 * To make sure our tests do not depend on real APIs, we just block them.
 */
export const blockUnmockedLlamaMarketApis = () =>
  ['prices.curve.finance', 'api.curve.finance', 'api.merkl.xyz'].forEach(hostname =>
    cy.intercept({ hostname }, req => {
      req.reply({
        statusCode: 503,
        body: { error: `Unexpected external API request in Cypress test: ${req.url}` },
      })
    }),
  )

/** The cypress-wagmi-test-connector generates a fresh address at runtime, so we have to mock by pattern. */
export const mockEmptyLlamaMarketUserData = () =>
  [
    /\/v1\/lending\/users\/all\/0x[a-fA-F0-9]{40}$/,
    /\/v1\/crvusd\/users\/all\/0x[a-fA-F0-9]{40}$/,
    /\/v1\/lending\/users\/lending_positions\/all\/0x[a-fA-F0-9]{40}$/,
  ].forEach(pathname =>
    cy.intercept({ method: 'GET', pathname, query: { include_closed: 'false' } }, req =>
      req.reply({
        body: {
          user: new URL(req.url).pathname.split('/').pop(),
          chains: fromEntries(LendingChains.map(chain => [chain, { count: 0, markets: [] }])),
        },
      }),
    ),
  )

/** Mocks the empty response for the bad debt endpoints. */
export const mockEmptyLlamaMarketBadDebt = () =>
  ['/v1/crvusd/liquidations/bad_debt', '/v1/lending/liquidations/bad_debt'].map(pathname =>
    cy.intercept({ method: 'GET', pathname, query: { fetch_on_chain: 'true' } }, { body: { data: [] } }),
  )
