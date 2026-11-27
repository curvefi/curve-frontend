import { ActivityTable } from '@ui/features/tables/activity-table/ActivityTable'
import { useMarketActivityBorrowEventsTable } from './hooks/useMarketActivityBorrowEventsTable'
import type { MarketBorrowActivityProps } from './types'

export const BorrowEventsTab = ({ activity }: { activity: MarketBorrowActivityProps }) => (
  <ActivityTable {...useMarketActivityBorrowEventsTable(activity)} />
)
