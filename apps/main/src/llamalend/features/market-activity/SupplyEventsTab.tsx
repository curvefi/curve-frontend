import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import { useMarketActivitySupplyEventsTable } from './hooks/useMarketActivitySupplyEventsTable'
import type { MarketSupplyActivityProps } from './types'

export const SupplyEventsTab = ({ activity }: { activity: MarketSupplyActivityProps }) => (
  <ActivityTable {...useMarketActivitySupplyEventsTable(activity)} />
)
