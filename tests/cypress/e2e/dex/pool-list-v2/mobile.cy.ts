import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  MOBILE_VIEWPORT,
  expandV2PoolRow,
  expectV2Tooltip,
  getV2PoolExpandedPanel,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'

const FULL_NETWORK_METRIC_IDS = [
  'pool-net-apy',
  'pool-volume',
  'pool-tvl',
  'pool-base-apy',
  'pool-weekly-base-apy',
  'pool-rewards-apy',
  'pool-crv-apy',
  'pool-points-campaign-0',
  'pool-points-campaign-1',
  'pool-points-campaign-2',
  'pool-points-campaign-3',
  'pool-points-campaign-4',
  'pool-age',
] as const

const FULL_NETWORK_CAMPAIGN_IDS = [
  'pool-points-campaign-0',
  'pool-points-campaign-1',
  'pool-points-campaign-2',
  'pool-points-campaign-3',
  'pool-points-campaign-4',
] as const

const LITE_METRIC_IDS = ['pool-volume', 'pool-tvl', 'pool-rewards-apy', 'pool-points-campaign-0', 'pool-age'] as const

const expectMetricOrder = (address: string, expectedIds: readonly string[]) => {
  getV2PoolExpandedPanel(address)
    .find('[data-testid$="-value"]')
    .should($values => {
      const metricIds = [...$values]
        .map(value => value.getAttribute('data-testid'))
        .filter((testId): testId is string => testId !== null)
        .map(testId => testId.replace(/-value$/, ''))

      expect(metricIds).to.deep.equal([...expectedIds])
    })
}

const expectCampaignRowsToBeLinks = (address: string, campaignIds: readonly string[]) => {
  for (const campaignId of campaignIds) {
    getV2PoolExpandedPanel(address)
      .find(`[data-testid="${campaignId}"]`)
      .closest('a')
      .should('have.length', 1)
      .and('be.visible')
  }
}

const visitAndExpand = (address: string, network: 'ethereum' | 'taiko' = 'ethereum') => {
  visitV2PoolList({ network, viewport: MOBILE_VIEWPORT })
  expandV2PoolRow(address)
}

describe('V2 pool-list mobile panels', () => {
  beforeEach(setupDexPoolListV2Mocks)

  it('shows the full-network metrics in the required mobile order', () => {
    const { address } = V2_POOL_FIXTURES.showcase
    visitAndExpand(address)

    expectMetricOrder(address, FULL_NETWORK_METRIC_IDS)

    getV2PoolExpandedPanel(address).find('[data-testid="pool-volume"]').should('contain.text', '24h Volume')
    getV2PoolExpandedPanel(address)
      .find('[data-testid="pool-crv-apy-value"]')
      .invoke('text')
      .should('match', /^\s*-?[\d,.]+(?:\+)?%\s*→\s*-?[\d,.]+(?:\+)?%\s*$/)

    expectCampaignRowsToBeLinks(address, FULL_NETWORK_CAMPAIGN_IDS)
  })

  it('opens a tooltip from a metric value', () => {
    const { address } = V2_POOL_FIXTURES.showcase
    visitAndExpand(address)

    expectV2Tooltip(() => getV2PoolExpandedPanel(address).find('[data-testid="pool-base-apy-value"]'))
  })

  it('shows the supported Lite metrics in the required mobile order', () => {
    const { address } = V2_POOL_FIXTURES.lite
    visitAndExpand(address, 'taiko')

    expectMetricOrder(address, LITE_METRIC_IDS)
    expectCampaignRowsToBeLinks(address, ['pool-points-campaign-0'])
  })

  it('does not create a campaign metric when campaign data is unavailable', () => {
    const { address } = V2_POOL_FIXTURES.empty
    visitAndExpand(address)

    getV2PoolExpandedPanel(address).find('[data-testid^="pool-points-campaign-"]').should('not.exist')
  })
})
