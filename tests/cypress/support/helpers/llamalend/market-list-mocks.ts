import {
  createLendingVaultChainsResponse,
  LendingChains,
  mockLendingSnapshots,
  mockLendingVaults,
  mockMerklCampaigns,
} from '@cy/support/helpers/lending-mocks'
import { fromEntries } from '@primitives/objects.utils'
import { mockMintMarkets, mockMintSnapshots } from '../minting-mocks'
import { mockTokenPrices } from '../tokens'

/**
 * To make sure our tests do not depend on real APIs, we just block them.
 */
export const blockUnmockedApis = () => {
  ;[
    'prices.curve.finance',
    'api.curve.finance',
    'api.merkl.xyz',
    'api-core.curve.finance',
    'api.coingecko.com',
  ].forEach(
    hostname =>
      void cy.intercept({ hostname }, req =>
        req.reply({ statusCode: 503, body: { error: `Unexpected API request in Cypress test: ${req.url}` } }),
      ),
  )
  cy.intercept('/api/merkl/*', req =>
    req.reply({ statusCode: 503, body: { error: `Unexpected API request in Cypress test: ${req.url}` } }),
  )
}

/** The cypress-wagmi-test-connector generates a fresh address at runtime, so we have to mock by pattern. */
export const mockEmptyLlamaMarketUserData = () =>
  [
    /\/v1\/lending\/users\/all\/0x[a-fA-F0-9]{40}$/,
    /\/v1\/crvusd\/users\/all\/0x[a-fA-F0-9]{40}$/,
    /\/v1\/lending\/users\/lending_positions\/all\/0x[a-fA-F0-9]{40}$/,
  ].forEach(
    pathname =>
      void cy.intercept({ method: 'GET', pathname, query: { include_closed: 'false' } }, req =>
        req.reply({
          body: {
            // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
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

const mockEmptyCrvUsdAmms = () =>
  cy.intercept(
    { method: 'GET', pathname: '/api/getVolumes/ethereum/crvusd-amms' },
    { body: { success: true, data: { amms: [], totalVolume: 0 }, generatedTimeMs: Date.now() } },
  )

export function setupLlamalendListMocks(vaultData = createLendingVaultChainsResponse()) {
  blockUnmockedApis()
  mockEmptyLlamaMarketUserData()
  mockEmptyLlamaMarketBadDebt()
  mockEmptyCrvUsdAmms()
  mockTokenPrices()
  const lendingVaults = mockLendingVaults(vaultData)
  mockLendingSnapshots().as('lend-snapshots')
  mockMintMarkets()
  mockMintSnapshots()
  mockMerklCampaigns()
  return { vaultData, lendingVaults }
}
