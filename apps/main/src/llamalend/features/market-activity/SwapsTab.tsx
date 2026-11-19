import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import { useMarketActivitySwapsTable } from './hooks/useMarketActivitySwapsTable'
import type { MarketActivityProps } from './types'

export const SwapsTab = ({ activity }: { activity: MarketActivityProps }) => (
  <ActivityTable {...useMarketActivitySwapsTable(activity)} />
)
