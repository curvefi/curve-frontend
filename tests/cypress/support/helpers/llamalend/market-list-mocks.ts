import { LEND_CHAINS, MINT_CHAINS } from '@curvefi/prices-api'
import {
  createLendingVaultChainsResponse,
  mockLendingSnapshots,
  mockLendingVaults,
  mockMerklCampaigns,
} from '@cy/support/helpers/lending-mocks'
import { mockLlamalendChartApis } from '@cy/support/helpers/llamalend/mocks/llamalend-chart.mocks'
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
        req.reply({ statusCode: 510, body: { error: `Unexpected API request in Cypress test: ${req.url}` } }),
      ),
  )
  cy.intercept('/api/merkl/*', req =>
    req.reply({ statusCode: 510, body: { error: `Unexpected API request in Cypress test: ${req.url}` } }),
  )
}

/** The cypress-wagmi-test-connector generates a fresh address at runtime, so we have to mock by pattern. */
export const mockEmptyMarketUserData = () =>
  [
    ...LEND_CHAINS.map(chain => new RegExp(`/v1/lending/users/${chain}/0x[a-fA-F0-9]{40}$`)),
    ...LEND_CHAINS.map(chain => new RegExp(`/v1/lending/users/lending_positions/${chain}/0x[a-fA-F0-9]{40}$`)),
    ...MINT_CHAINS.map(chain => new RegExp(`/v1/crvusd/users/${chain}/0x[a-fA-F0-9]{40}$`)),
  ].forEach(
    pathname =>
      void cy.intercept({ method: 'GET', pathname }, req =>
        req.reply({
          body: {
            // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
            user: new URL(req.url).pathname.split('/').pop(),
            markets: [],
            page: 1,
            per_page: 100,
            count: 0,
          },
        }),
      ),
  )

/** Mocks the empty response for the bad debt endpoints. */
export const mockEmptyMarketBadDebt = () =>
  ['/v1/crvusd/liquidations/bad_debt', '/v1/lending/liquidations/bad_debt'].map(pathname =>
    cy.intercept({ method: 'GET', pathname, query: { fetch_on_chain: 'true' } }, { body: { data: [] } }),
  )

const mockEmptyCrvUsdAmms = () =>
  cy.intercept(
    { method: 'GET', pathname: '/api/getVolumes/ethereum/crvusd-amms' },
    { body: { success: true, data: { amms: [], totalVolume: 0 }, generatedTimeMs: Date.now() } },
  )

/**
 * During component tests, the backend can take a long time to reply when we send a new_hash.
 * The transactions do not exist in the backend anyway, since we are in a fork, so we mock an empty response.
 */
export const mockNewHashCollateralEvents = () => {
  cy.intercept(
    { method: 'GET', pathname: /^\/v1\/(crvusd|lending)\/collateral_events\/.+/, query: { new_hash: /.+/ } },
    req => {
      const [, , endpoint, , chain, controller, user] = new URL(req.url).pathname.split('/')
      const body = {
        chain,
        controller,
        user,
        total_deposit: 0,
        total_deposit_from_user: 0,
        total_borrowed: 0,
        total_deposit_precise: '0',
        total_borrowed_precise: '0',
        total_deposit_from_user_precise: '0',
        total_deposit_from_user_usd_value: 0,
        total_deposit_usd_value: 0,
        ...(endpoint === 'lending' && { total_borrowed_usd_value: 0 }),
        count: 0,
        pagination: null,
        page: null,
        data: [],
      }
      req.reply({ body })
    },
  )
}

export function setupLlamalendListMocks(vaultData = createLendingVaultChainsResponse()) {
  blockUnmockedApis()
  mockEmptyMarketUserData()
  mockEmptyMarketBadDebt()
  mockEmptyCrvUsdAmms()
  mockLlamalendChartApis()
  mockTokenPrices()
  const lendingVaults = mockLendingVaults(vaultData)
  mockLendingSnapshots().as('lend-snapshots')
  mockMintMarkets()
  mockMintSnapshots()
  mockMerklCampaigns()
  return { vaultData, lendingVaults }
}
