import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import { useMarketActivityEventsTable } from './hooks/useMarketActivityEventsTable'
import type { MarketActivityProps } from './types'

export const EventsTab = ({ activity }: { activity: MarketActivityProps }) => (
  <ActivityTable {...useMarketActivityEventsTable(activity)} />
)
