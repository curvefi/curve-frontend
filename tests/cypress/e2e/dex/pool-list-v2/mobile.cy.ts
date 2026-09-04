import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  MOBILE_VIEWPORT,
  expandV2PoolRow,
  getV2PoolExpandedPanel,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'

const FULL_NETWORK_METRIC_IDS = ['pool-net-rate', 'pool-volume', 'pool-tvl', 'pool-age'] as const
const LITE_METRIC_IDS = ['pool-net-rate', 'pool-tvl'] as const

const expectMetricOrder = (address: string, expectedIds: readonly string[]) => {
  const metricValueSelector = expectedIds.map(id => `[data-testid="${id}-value"]`).join(',')

  getV2PoolExpandedPanel(address)
    .find(metricValueSelector)
    .should($values => {
      const metricIds = [...$values]
        .map(value => value.getAttribute('data-testid'))
        .filter((testId): testId is string => testId !== null)
        .map(testId => testId.replace(/-value$/, ''))

      expect(metricIds).to.deep.equal([...expectedIds])
    })
}

const expectPoolTokens = (address: string, representativeSymbol: string) => {
  getV2PoolExpandedPanel(address).find('[data-testid="pool-tokens"]').should('be.visible')
  getV2PoolExpandedPanel(address).find('[data-testid="pool-tokens"]').contains(representativeSymbol)
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
    expectPoolTokens(address, 'USDC')
  })

  it('shows the supported Lite metrics in the required mobile order', () => {
    const { address } = V2_POOL_FIXTURES.lite
    visitAndExpand(address, 'taiko')
    expectMetricOrder(address, LITE_METRIC_IDS)
    expectPoolTokens(address, 'USDC')
  })
})
