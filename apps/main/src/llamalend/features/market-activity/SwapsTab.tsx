import { ActivityTable } from '@ui/features/tables/activity-table/ActivityTable'
import { useMarketActivitySwapsTable } from './hooks/useMarketActivitySwapsTable'
import type { MarketBorrowActivityProps } from './types'

export const SwapsTab = ({ activity }: { activity: MarketBorrowActivityProps }) => (
  <ActivityTable {...useMarketActivitySwapsTable(activity)} />
)
