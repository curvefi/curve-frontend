import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  MOBILE_VIEWPORT,
  expandV2PoolRow,
  getV2PoolExpandedPanel,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'

const FULL_NETWORK_METRIC_IDS = ['pool-net-apy', 'pool-volume', 'pool-tvl', 'pool-age'] as const
const LITE_METRIC_IDS = ['pool-net-apy', 'pool-tvl'] as const

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
  })

  it('shows the supported Lite metrics in the required mobile order', () => {
    const { address } = V2_POOL_FIXTURES.lite
    visitAndExpand(address, 'taiko')
    expectMetricOrder(address, LITE_METRIC_IDS)
  })
})
